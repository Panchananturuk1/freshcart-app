package com.freshcart.android.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingBasket
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.freshcart.android.ProductDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    state: FreshCartUiState,
    imageUrl: (String) -> String,
    onRefresh: () -> Unit,
    onSearch: () -> Unit,
    onCategory: (String) -> Unit,
    onOpen: (String) -> Unit,
    onAdd: (String) -> Unit,
    onMinus: (String) -> Unit,
    onSeeAll: () -> Unit,
) {
    val address = state.addresses.find { it.id == state.selectedAddressId } ?: state.addresses.firstOrNull()
    val greeting = state.user?.name?.let { "Hi, ${it.substringBefore(' ')}" } ?: "Groceries in 10 minutes"
    PullToRefreshBox(isRefreshing = state.refreshing, onRefresh = onRefresh) {
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(8.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Deliver in 10–15 mins", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        Text(address?.title ?: "Sector 42, Gurugram", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                }
            }
            item {
                Text(greeting, style = MaterialTheme.typography.headlineSmall)
            }
            item {
                Box(Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = "",
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                        placeholder = { Text("Search milk, bread, fruits...") },
                        shape = RoundedCornerShape(18.dp),
                    )
                    Box(
                        Modifier
                            .matchParentSize()
                            .clickable(onClick = onSearch),
                    )
                }
            }
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                    shape = RoundedCornerShape(28.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Column(Modifier.padding(20.dp)) {
                        Text("Everyday groceries", color = MaterialTheme.colorScheme.onPrimary, style = MaterialTheme.typography.labelLarge)
                        Text("At your door in 10 minutes", color = MaterialTheme.colorScheme.onPrimary, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(8.dp))
                        Text("Free delivery above ₹499", color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f))
                    }
                }
            }
            item {
                Text("Shop by category", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Row(Modifier.horizontalScroll(rememberScrollState())) {
                    state.categories.forEach { category ->
                        CategoryChip(category.name, category.emoji, state.selectedCategory == category.id) { onCategory(category.id) }
                    }
                }
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Trending near you", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    TextButton(onClick = onSeeAll) { Text("See all") }
                }
            }
            if (state.loading) {
                item { Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
            }
            items(state.featured.chunked(2)) { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    row.forEach { product ->
                        ProductCard(
                            product = product,
                            imageUrl = imageUrl(product.imagePath),
                            quantity = state.quantityOf(product.id),
                            onOpen = { onOpen(product.slug) },
                            onAdd = { onAdd(product.id) },
                            onMinus = { onMinus(product.id) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrowseScreen(
    state: FreshCartUiState,
    imageUrl: (String) -> String,
    onRefresh: () -> Unit,
    onQuery: (String) -> Unit,
    onCategory: (String) -> Unit,
    onOpen: (String) -> Unit,
    onAdd: (String) -> Unit,
    onMinus: (String) -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = state.query,
            onValueChange = onQuery,
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
            placeholder = { Text("Search groceries") },
            singleLine = true,
            shape = RoundedCornerShape(18.dp),
        )
        Spacer(Modifier.height(8.dp))
        Row(Modifier.horizontalScroll(rememberScrollState())) {
            CategoryChip("All", "", state.selectedCategory == "all") { onCategory("all") }
            state.categories.forEach { CategoryChip(it.name, it.emoji, state.selectedCategory == it.id) { onCategory(it.id) } }
        }
        Spacer(Modifier.height(8.dp))
        PullToRefreshBox(isRefreshing = state.refreshing, onRefresh = onRefresh, modifier = Modifier.fillMaxSize()) {
            if (!state.loading && state.products.isEmpty()) {
                EmptyState("No groceries found", "Try another search or category.", "Clear search") { onQuery("") }
            } else {
                LazyVerticalGrid(columns = GridCells.Fixed(2), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), contentPadding = PaddingValues(bottom = 24.dp)) {
                    items(state.products, key = { it.id }) { product ->
                        ProductCard(
                            product = product,
                            imageUrl = imageUrl(product.imagePath),
                            quantity = state.quantityOf(product.id),
                            onOpen = { onOpen(product.slug) },
                            onAdd = { onAdd(product.id) },
                            onMinus = { onMinus(product.id) },
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductScreen(
    slug: String,
    state: FreshCartUiState,
    imageUrl: (String) -> String,
    onBack: () -> Unit,
    onLoad: (String) -> Unit,
    onAdd: (String) -> Unit,
    onMinus: (String) -> Unit,
    onCart: () -> Unit,
) {
    val product = state.productDetails.values.find { it.slug == slug } ?: state.products.find { it.slug == slug }
    LaunchedEffect(slug) { onLoad(slug) }
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(product?.name ?: "Product") }, navigationIcon = {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
            }, actions = {
                IconButton(onClick = onCart) { Icon(Icons.Outlined.ShoppingBasket, contentDescription = "Cart") }
            })
        },
    ) { padding ->
        if (product == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            return@Scaffold
        }
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)) {
            AsyncImage(model = imageUrl(product.imagePath), contentDescription = product.name, modifier = Modifier.fillMaxWidth().aspectRatio(1.1f).clip(RoundedCornerShape(28.dp)), contentScale = ContentScale.Crop)
            Spacer(Modifier.height(16.dp))
            Text(product.brand.uppercase(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
            Text(product.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text("${product.unit} • ${product.eta} • ${product.rating}★", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f))
            Spacer(Modifier.height(12.dp))
            Text(formatInr(product.price), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            Text(product.description, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                QuantityControl(quantity = state.quantityOf(product.id), onAdd = { onAdd(product.id) }, onMinus = { onMinus(product.id) })
                Button(onClick = { onAdd(product.id); onCart() }, modifier = Modifier.height(52.dp)) { Text("Go to cart") }
            }
        }
    }
}

@Composable
fun CartScreen(
    state: FreshCartUiState,
    imageUrl: (String) -> String,
    onQty: (String, Int) -> Unit,
    onCheckout: () -> Unit,
    onBrowse: () -> Unit,
) {
    val lines = state.cart.mapNotNull { line -> state.productDetails[line.productId]?.let { it to line.quantity } }
    val subtotal = lines.sumOf { it.first.price * it.second }
    val delivery = if (subtotal > 499 || subtotal == 0) 0 else 49
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Your cart", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        if (lines.isEmpty()) {
            EmptyState("Cart is empty", "Add milk, fruits, and snacks to get started.", "Browse groceries", onBrowse)
        } else {
            LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp), contentPadding = PaddingValues(vertical = 12.dp)) {
                items(lines, key = { it.first.id }) { (product, qty) ->
                    CartLineRow(product, imageUrl(product.imagePath), qty, { onQty(product.id, qty + 1) }, { onQty(product.id, qty - 1) })
                }
            }
            Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Subtotal"); Text(formatInr(subtotal), fontWeight = FontWeight.Bold)
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Delivery"); Text(if (delivery == 0) "Free" else formatInr(delivery))
                    }
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = onCheckout, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                        Text("Checkout • ${formatInr(subtotal + delivery)}")
                    }
                }
            }
        }
    }
}

@Composable
private fun CartLineRow(product: ProductDto, imageUrl: String, qty: Int, onAdd: () -> Unit, onMinus: () -> Unit) {
    Card(shape = RoundedCornerShape(20.dp)) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(model = imageUrl, contentDescription = product.name, modifier = Modifier.size(72.dp).clip(RoundedCornerShape(16.dp)), contentScale = ContentScale.Crop)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(product.name, fontWeight = FontWeight.SemiBold, maxLines = 2)
                Text(product.unit, style = MaterialTheme.typography.labelSmall)
                Text(formatInr(product.price * qty), fontWeight = FontWeight.Bold)
            }
            QuantityControl(quantity = qty, onAdd = onAdd, onMinus = onMinus)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    state: FreshCartUiState,
    onBack: () -> Unit,
    onSelectAddress: (String) -> Unit,
    onPayment: (String) -> Unit,
    onAddAddress: () -> Unit,
    onPlace: () -> Unit,
) {
    val lines = state.cart.mapNotNull { line -> state.productDetails[line.productId]?.let { it to line.quantity } }
    val subtotal = lines.sumOf { it.first.price * it.second }
    val delivery = if (subtotal > 499) 0 else 49
    Scaffold(topBar = {
        TopAppBar(title = { Text("Checkout") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } })
    }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("Delivery address", fontWeight = FontWeight.Bold)
            if (state.addresses.isEmpty()) {
                OutlinedButton(onClick = onAddAddress) { Text("Add an address") }
            } else {
                state.addresses.forEach { address ->
                    FilterChip(
                        selected = address.id == state.selectedAddressId,
                        onClick = { onSelectAddress(address.id) },
                        label = { Text("${address.title} • ${address.city}") },
                    )
                }
                TextButton(onClick = onAddAddress) { Text("Add another address") }
            }
            Text("Pay with", fontWeight = FontWeight.Bold)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("UPI", "CARD", "WALLET").forEach { method ->
                    FilterChip(selected = state.paymentMethod == method, onClick = { onPayment(method) }, label = { Text(method) })
                }
            }
            Text("Total ${formatInr(subtotal + delivery)}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Button(onClick = onPlace, enabled = state.cart.isNotEmpty(), modifier = Modifier.fillMaxWidth().height(52.dp)) { Text("Place order") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    title: String,
    subtitle: String,
    isRegister: Boolean,
    error: String?,
    onSubmit: (name: String, email: String, phone: String, password: String) -> Unit,
    onToggle: () -> Unit,
    onBack: () -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Scaffold(topBar = {
        TopAppBar(title = { Text(title) }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } })
    }) { padding ->
        Column(Modifier.padding(padding).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(subtitle, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
            if (isRegister) OutlinedTextField(name, { name = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(email, { email = it }, label = { Text("Email") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth())
            if (isRegister) OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), modifier = Modifier.fillMaxWidth())
            OutlinedTextField(password, { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
            if (error != null) Text(error, color = MaterialTheme.colorScheme.error)
            Button(onClick = { onSubmit(name, email, phone, password) }, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text(if (isRegister) "Create account" else "Sign in") }
            TextButton(onClick = onToggle) { Text(if (isRegister) "Already have an account? Sign in" else "New here? Create an account") }
            Text("Demo: jamie@example.com / freshcart123", style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
fun AccountScreen(
    state: FreshCartUiState,
    onSignIn: () -> Unit,
    onRegister: () -> Unit,
    onOrders: () -> Unit,
    onAddresses: () -> Unit,
    onPrivacy: () -> Unit,
    onLogout: () -> Unit,
) {
    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Account", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        if (state.user == null) {
            Text("Sign in to track orders and save addresses.")
            Button(onClick = onSignIn, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text("Sign in") }
            OutlinedButton(onClick = onRegister, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text("Create account") }
        } else {
            Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(16.dp)) {
                    Text(state.user.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(state.user.email)
                }
            }
            Button(onClick = onOrders, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text("Your orders") }
            OutlinedButton(onClick = onAddresses, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text("Saved addresses") }
            TextButton(onClick = onLogout) { Text("Sign out") }
        }
        TextButton(onClick = onPrivacy) { Text("Privacy policy") }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressScreen(
    state: FreshCartUiState,
    onBack: () -> Unit,
    onSelect: (String) -> Unit,
    onSave: (title: String, line1: String, line2: String, city: String, label: String) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var line1 by remember { mutableStateOf("") }
    var line2 by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Gurugram") }
    Scaffold(topBar = {
        TopAppBar(title = { Text("Addresses") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } })
    }) { padding ->
        Column(Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            state.addresses.forEach { address ->
                FilterChip(selected = address.id == state.selectedAddressId, onClick = { onSelect(address.id) }, label = { Text("${address.title} — ${address.line1}") })
            }
            Text("Add address", fontWeight = FontWeight.Bold)
            OutlinedTextField(title, { title = it }, label = { Text("Label, e.g. Home") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(line1, { line1 = it }, label = { Text("Address line 1") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(line2, { line2 = it }, label = { Text("Landmark") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(city, { city = it }, label = { Text("City") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = { onSave(title.ifBlank { "Home" }, line1, line2.ifBlank { "Near main gate" }, city.ifBlank { "Gurugram" }, "HOME") }, enabled = line1.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Save address") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(state: FreshCartUiState, onBack: () -> Unit, onOpen: (String) -> Unit, onSignIn: () -> Unit) {
    Scaffold(topBar = {
        TopAppBar(title = { Text("Orders") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } })
    }) { padding ->
        if (state.user == null) {
            Box(Modifier.padding(padding)) { EmptyState("Sign in required", "Track live orders after you sign in.", "Sign in", onSignIn) }
        } else {
            LazyColumn(Modifier.padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(state.orders, key = { it.displayId.ifBlank { it.id.orEmpty() } }) { order ->
                    val id = order.displayId.ifBlank { order.id.orEmpty() }
                    Card(onClick = { onOpen(id) }, shape = RoundedCornerShape(20.dp)) {
                        Column(Modifier.padding(16.dp)) {
                            Text(id, fontWeight = FontWeight.Bold)
                            Text("${order.status} • ${order.etaMinutes} mins")
                            Text(formatInr(order.total))
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrackingScreen(orderId: String, state: FreshCartUiState, onBack: () -> Unit, onLoad: (String) -> Unit) {
    LaunchedEffect(orderId) { onLoad(orderId) }
    val tracking = state.tracking
    Scaffold(topBar = {
        TopAppBar(title = { Text("Tracking") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } })
    }) { padding ->
        Column(Modifier.padding(padding).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (tracking == null) {
                CircularProgressIndicator()
            } else {
                Text(tracking.id, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text(tracking.status, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Text("ETA ${tracking.etaMinutes} mins • ${tracking.rider?.name ?: "Rider assigned"}")
                tracking.timeline.forEach { step ->
                    Column(Modifier.padding(vertical = 6.dp)) {
                        Text(step.status, fontWeight = FontWeight.SemiBold)
                        Text("${step.time}  ${step.note}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
