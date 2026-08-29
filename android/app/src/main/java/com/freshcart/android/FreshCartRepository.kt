package com.freshcart.android

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

class FreshCartRepository(context: Context) {
    private val appContext = context.applicationContext
    private val prefs = appContext.getSharedPreferences("freshcart_store", Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val created = createApi(appContext)
    private val api = created.first
    private val cookieJar = created.second

    val imageBaseUrl: String = BuildConfig.API_BASE_URL.trimEnd('/')

    fun imageUrl(path: String): String {
        if (path.startsWith("http")) return path
        return imageBaseUrl + if (path.startsWith("/")) path else "/$path"
    }

    fun readUser(): SessionUser? {
        val raw = prefs.getString("user", null) ?: return null
        return runCatching { json.decodeFromString<SessionUser>(raw) }.getOrNull()
    }

    fun readCart(): List<CartItem> = json.decodeCart(prefs.getString("cart", null))

    fun readAddressId(): String? = prefs.getString("addressId", null)

    private fun persistUser(user: SessionUser?) {
        prefs.edit().apply {
            if (user == null) remove("user") else putString("user", json.encodeToString(SessionUser.serializer(), user))
            apply()
        }
    }

    fun persistCart(items: List<CartItem>) {
        prefs.edit().putString("cart", json.encodeCart(items)).apply()
    }

    fun persistAddressId(id: String?) {
        prefs.edit().putString("addressId", id).apply()
    }

    suspend fun loadCatalog(query: String = "", category: String = "all"): Pair<List<CategoryDto>, List<ProductDto>> =
        withContext(Dispatchers.IO) {
            val categories = runCatching { api.categories().items }.getOrDefault(emptyList())
            val products = runCatching {
                api.catalog(
                    query = query.ifBlank { null },
                    category = if (category == "all") null else category,
                ).items.filter { it.hasImage }
            }.getOrDefault(emptyList())
            categories to products
        }

    suspend fun loadProduct(slug: String): ProductDto = withContext(Dispatchers.IO) { api.product(slug) }

    suspend fun loadProductsByIds(ids: List<String>): List<ProductDto> = withContext(Dispatchers.IO) {
        if (ids.isEmpty()) emptyList() else api.productsByIds(mapOf("ids" to ids)).items
    }

    suspend fun refreshSession(): SessionUser? = withContext(Dispatchers.IO) {
        val user = runCatching { api.session().user }.getOrNull()
        persistUser(user)
        user
    }

    suspend fun login(email: String, password: String): SessionUser {
        val response = withContext(Dispatchers.IO) { api.login(LoginBody(email.trim(), password)) }
        val body = response.body()
        if (!response.isSuccessful || body?.user == null) {
            throw IllegalStateException(readError(response) ?: body?.message ?: "Could not sign in. Check your email and password.")
        }
        persistUser(body.user)
        return body.user
    }

    suspend fun register(name: String, email: String, phone: String, password: String): SessionUser {
        val response = withContext(Dispatchers.IO) {
            api.register(RegisterBody(name.trim(), email.trim(), phone.trim(), password))
        }
        val body = response.body()
        if (!response.isSuccessful || body?.user == null) {
            throw IllegalStateException(readError(response) ?: body?.message ?: "Could not create your account.")
        }
        persistUser(body.user)
        return body.user
    }

    suspend fun logout() {
        runCatching { withContext(Dispatchers.IO) { api.logout() } }
        cookieJar.clear()
        persistUser(null)
        persistAddressId(null)
    }

    suspend fun loadAddresses(): List<AddressDto> = withContext(Dispatchers.IO) {
        runCatching { api.addresses().items }.getOrDefault(emptyList())
    }

    suspend fun createAddress(body: CreateAddressBody): AddressDto = withContext(Dispatchers.IO) { api.createAddress(body) }

    suspend fun loadOrders(): List<OrderDto> = withContext(Dispatchers.IO) {
        runCatching { api.orders().items }.getOrDefault(emptyList())
    }

    suspend fun placeOrder(addressId: String?, payment: String, items: List<CartItem>): String {
        val response = withContext(Dispatchers.IO) {
            api.placeOrder(
                PlaceOrderBody(
                    addressId = addressId,
                    paymentMethod = payment,
                    items = items.map { CartLine(it.productId, it.quantity) },
                ),
            )
        }
        val body = response.body()
        if (!response.isSuccessful || body?.orderId.isNullOrBlank()) {
            throw IllegalStateException(readError(response) ?: body?.message ?: "Could not place the order.")
        }
        return body!!.orderId!!
    }

    suspend fun tracking(orderId: String): TrackingDto = withContext(Dispatchers.IO) { api.tracking(orderId) }

    private fun readError(response: retrofit2.Response<*>): String? {
        val raw = response.errorBody()?.string().orEmpty()
        if (raw.isBlank()) return null
        return runCatching { json.decodeFromString(AuthResponse.serializer(), raw).message }.getOrNull()
    }
}
