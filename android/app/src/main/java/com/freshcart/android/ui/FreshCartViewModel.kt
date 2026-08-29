package com.freshcart.android.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.freshcart.android.AddressDto
import com.freshcart.android.CartItem
import com.freshcart.android.CategoryDto
import com.freshcart.android.CreateAddressBody
import com.freshcart.android.FreshCartRepository
import com.freshcart.android.OrderDto
import com.freshcart.android.ProductDto
import com.freshcart.android.SessionUser
import com.freshcart.android.TrackingDto
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FreshCartUiState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val user: SessionUser? = null,
    val categories: List<CategoryDto> = emptyList(),
    val products: List<ProductDto> = emptyList(),
    val query: String = "",
    val selectedCategory: String = "all",
    val cart: List<CartItem> = emptyList(),
    val productDetails: Map<String, ProductDto> = emptyMap(),
    val addresses: List<AddressDto> = emptyList(),
    val selectedAddressId: String? = null,
    val orders: List<OrderDto> = emptyList(),
    val tracking: TrackingDto? = null,
    val paymentMethod: String = "UPI",
    val error: String? = null,
    val notice: String? = null,
) {
    val cartCount: Int get() = cart.sumOf { it.quantity }
    val featured: List<ProductDto> get() = products.take(8)
    fun quantityOf(productId: String) = cart.find { it.productId == productId }?.quantity ?: 0
}

class FreshCartViewModel(private val repository: FreshCartRepository) : ViewModel() {
    private val _state = MutableStateFlow(FreshCartUiState(user = repository.readUser(), cart = repository.readCart(), selectedAddressId = repository.readAddressId()))
    val state: StateFlow<FreshCartUiState> = _state
    private var searchJob: Job? = null

    init {
        viewModelScope.launch {
            repository.refreshSession()
            refreshAll()
        }
    }

    fun imageUrl(path: String) = repository.imageUrl(path)

    fun refreshAll() {
        viewModelScope.launch {
            _state.update { it.copy(loading = it.products.isEmpty(), refreshing = it.products.isNotEmpty(), error = null) }
            runCatching {
                val (categories, products) = repository.loadCatalog(_state.value.query, _state.value.selectedCategory)
                val details = repository.loadProductsByIds(_state.value.cart.map { it.productId })
                val user = repository.refreshSession() ?: repository.readUser()
                val addresses = if (user != null) repository.loadAddresses() else emptyList()
                val orders = if (user != null) repository.loadOrders() else emptyList()
                val selected = _state.value.selectedAddressId
                    ?: addresses.firstOrNull { it.isDefault }?.id
                    ?: addresses.firstOrNull()?.id
                _state.update {
                    it.copy(
                        loading = false,
                        refreshing = false,
                        categories = categories,
                        products = products,
                        productDetails = it.productDetails + details.associateBy { product -> product.id } + products.associateBy { product -> product.id },
                        addresses = addresses,
                        orders = orders,
                        selectedAddressId = selected,
                        user = user,
                    )
                }
                repository.persistAddressId(selected)
            }.onFailure { error ->
                _state.update { it.copy(loading = false, refreshing = false, error = error.message ?: "Could not load groceries.") }
            }
        }
    }

    fun onQueryChange(value: String) {
        _state.update { it.copy(query = value) }
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(250)
            refreshCatalog()
        }
    }

    fun onCategory(id: String) {
        _state.update { it.copy(selectedCategory = id) }
        refreshCatalog()
    }

    private fun refreshCatalog() {
        viewModelScope.launch {
            val (categories, products) = repository.loadCatalog(_state.value.query, _state.value.selectedCategory)
            _state.update { it.copy(categories = categories, products = products, productDetails = it.productDetails + products.associateBy { product -> product.id }) }
        }
    }

    fun addToCart(productId: String) = updateQty(productId, _state.value.quantityOf(productId) + 1)

    fun setQty(productId: String, qty: Int) = updateQty(productId, qty)

    private fun updateQty(productId: String, qty: Int) {
        val next = if (qty <= 0) {
            _state.value.cart.filter { it.productId != productId }
        } else {
            val existing = _state.value.cart.find { it.productId == productId }
            if (existing == null) _state.value.cart + CartItem(productId, qty)
            else _state.value.cart.map { if (it.productId == productId) it.copy(quantity = qty) else it }
        }
        repository.persistCart(next)
        _state.update { it.copy(cart = next) }
        viewModelScope.launch {
            val details = repository.loadProductsByIds(next.map { it.productId })
            _state.update { it.copy(productDetails = it.productDetails + details.associateBy { product -> product.id }) }
        }
    }

    fun selectAddress(id: String) {
        repository.persistAddressId(id)
        _state.update { it.copy(selectedAddressId = id) }
    }

    fun setPayment(method: String) = _state.update { it.copy(paymentMethod = method) }

    fun login(email: String, password: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(error = null) }
            runCatching { repository.login(email, password) }
                .onSuccess { user ->
                    _state.update { it.copy(user = user) }
                    refreshAll()
                    onDone()
                }
                .onFailure { error -> _state.update { it.copy(error = error.message) } }
        }
    }

    fun register(name: String, email: String, phone: String, password: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(error = null) }
            runCatching { repository.register(name, email, phone, password) }
                .onSuccess { user ->
                    _state.update { it.copy(user = user) }
                    refreshAll()
                    onDone()
                }
                .onFailure { error -> _state.update { it.copy(error = error.message) } }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
            _state.update { it.copy(user = null, addresses = emptyList(), orders = emptyList(), selectedAddressId = null, cart = emptyList()) }
            repository.persistCart(emptyList())
        }
    }

    fun addAddress(title: String, line1: String, line2: String, city: String, label: String, onDone: () -> Unit) {
        viewModelScope.launch {
            runCatching {
                repository.createAddress(
                    CreateAddressBody(label = label, title = title, line1 = line1, line2 = line2, city = city, isDefault = _state.value.addresses.isEmpty()),
                )
            }.onSuccess {
                val addresses = repository.loadAddresses()
                val selected = it.id
                repository.persistAddressId(selected)
                _state.update { state -> state.copy(addresses = addresses, selectedAddressId = selected, notice = "Address saved") }
                onDone()
            }.onFailure { _state.update { state -> state.copy(error = it.message) } }
        }
    }

    fun placeOrder(onDone: (String) -> Unit) {
        val state = _state.value
        if (state.user == null) {
            _state.update { it.copy(error = "Sign in to place your order.") }
            return
        }
        if (state.cart.isEmpty()) return
        viewModelScope.launch {
            runCatching { repository.placeOrder(state.selectedAddressId, state.paymentMethod, state.cart) }
                .onSuccess { orderId ->
                    repository.persistCart(emptyList())
                    _state.update { it.copy(cart = emptyList(), notice = "Order $orderId placed") }
                    refreshAll()
                    onDone(orderId)
                }
                .onFailure { error -> _state.update { it.copy(error = error.message) } }
        }
    }

    fun loadTracking(orderId: String) {
        viewModelScope.launch {
            runCatching { repository.tracking(orderId) }
                .onSuccess { tracking -> _state.update { it.copy(tracking = tracking, error = null) } }
                .onFailure { error -> _state.update { it.copy(error = error.message, tracking = null) } }
        }
    }

    fun consumeMessages() = _state.update { it.copy(error = null, notice = null) }

    fun loadProduct(slug: String) {
        if (slug.isBlank()) return
        viewModelScope.launch {
            runCatching { repository.loadProduct(slug) }
                .onSuccess { product ->
                    _state.update { it.copy(productDetails = it.productDetails + (product.id to product)) }
                }
                .onFailure { error ->
                    _state.update { it.copy(error = error.message ?: "Could not load this product.") }
                }
        }
    }

    companion object {
        fun factory(repository: FreshCartRepository) = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T = FreshCartViewModel(repository) as T
        }
    }
}
