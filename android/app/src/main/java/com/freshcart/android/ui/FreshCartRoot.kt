package com.freshcart.android.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingBasket
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab("home", "Home", Icons.Outlined.Home),
    Tab("browse", "Browse", Icons.Outlined.GridView),
    Tab("cart", "Cart", Icons.Outlined.ShoppingBasket),
    Tab("account", "Account", Icons.Outlined.Person),
)

@Composable
fun FreshCartRoot(viewModel: FreshCartViewModel) {
    val nav = rememberNavController()
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route.orEmpty()
    val showBar = route in tabs.map { it.route }

    LaunchedEffect(state.error, state.notice) {
        state.error?.let { snackbar.showSnackbar(it); viewModel.consumeMessages() }
        state.notice?.let { snackbar.showSnackbar(it); viewModel.consumeMessages() }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            if (showBar) {
                NavigationBar {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = route == tab.route,
                            onClick = {
                                nav.navigate(tab.route) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                if (tab.route == "cart" && state.cartCount > 0) {
                                    BadgedBox(badge = { Badge { Text("${state.cartCount}") } }) {
                                        Icon(tab.icon, contentDescription = tab.label)
                                    }
                                } else {
                                    Icon(tab.icon, contentDescription = tab.label)
                                }
                            },
                            label = { Text(tab.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(navController = nav, startDestination = "home", modifier = Modifier.padding(padding)) {
            composable("home") {
                HomeScreen(
                    state = state,
                    imageUrl = viewModel::imageUrl,
                    onRefresh = viewModel::refreshAll,
                    onSearch = { nav.navigate("browse") },
                    onCategory = {
                        viewModel.onCategory(it)
                        nav.navigate("browse")
                    },
                    onOpen = { nav.navigate("product/$it") },
                    onAdd = viewModel::addToCart,
                    onMinus = { id -> viewModel.setQty(id, state.quantityOf(id) - 1) },
                    onSeeAll = { nav.navigate("browse") },
                )
            }
            composable("browse") {
                BrowseScreen(
                    state = state,
                    imageUrl = viewModel::imageUrl,
                    onRefresh = viewModel::refreshAll,
                    onQuery = viewModel::onQueryChange,
                    onCategory = viewModel::onCategory,
                    onOpen = { nav.navigate("product/$it") },
                    onAdd = viewModel::addToCart,
                    onMinus = { id -> viewModel.setQty(id, state.quantityOf(id) - 1) },
                )
            }
            composable("cart") {
                CartScreen(
                    state = state,
                    imageUrl = viewModel::imageUrl,
                    onQty = viewModel::setQty,
                    onCheckout = {
                        if (state.user == null) nav.navigate("signin") else nav.navigate("checkout")
                    },
                    onBrowse = { nav.navigate("browse") },
                )
            }
            composable("account") {
                AccountScreen(
                    state = state,
                    onSignIn = { nav.navigate("signin") },
                    onRegister = { nav.navigate("register") },
                    onOrders = { nav.navigate("orders") },
                    onAddresses = { nav.navigate("addresses") },
                    onPrivacy = {
                        val intent = android.content.Intent(
                            android.content.Intent.ACTION_VIEW,
                            android.net.Uri.parse(com.freshcart.android.BuildConfig.API_BASE_URL.trimEnd('/') + "/privacy"),
                        )
                        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                        nav.context.startActivity(intent)
                    },
                    onLogout = viewModel::logout,
                )
            }
            composable("product/{slug}", arguments = listOf(navArgument("slug") { type = NavType.StringType })) { entry ->
                val slug = entry.arguments?.getString("slug").orEmpty()
                ProductScreen(
                    slug = slug,
                    state = state,
                    imageUrl = viewModel::imageUrl,
                    onBack = { nav.popBackStack() },
                    onLoad = viewModel::loadProduct,
                    onAdd = viewModel::addToCart,
                    onMinus = { id -> viewModel.setQty(id, state.quantityOf(id) - 1) },
                    onCart = { nav.navigate("cart") },
                )
            }
            composable("signin") {
                AuthScreen(
                    title = "Welcome back",
                    subtitle = "Sign in to checkout and track orders",
                    isRegister = false,
                    error = state.error,
                    onSubmit = { name, email, phone, password -> viewModel.login(email, password) { nav.popBackStack() } },
                    onToggle = { nav.navigate("register") },
                    onBack = { nav.popBackStack() },
                )
            }
            composable("register") {
                AuthScreen(
                    title = "Create account",
                    subtitle = "10-minute grocery delivery at your door",
                    isRegister = true,
                    error = state.error,
                    onSubmit = { name, email, phone, password -> viewModel.register(name, email, phone, password) { nav.popBackStack() } },
                    onToggle = { nav.navigate("signin") },
                    onBack = { nav.popBackStack() },
                )
            }
            composable("checkout") {
                CheckoutScreen(
                    state = state,
                    onBack = { nav.popBackStack() },
                    onSelectAddress = viewModel::selectAddress,
                    onPayment = viewModel::setPayment,
                    onAddAddress = { nav.navigate("addresses") },
                    onPlace = { viewModel.placeOrder { nav.navigate("tracking/$it") { popUpTo("home") } } },
                )
            }
            composable("addresses") {
                AddressScreen(
                    state = state,
                    onBack = { nav.popBackStack() },
                    onSelect = viewModel::selectAddress,
                    onSave = { title, line1, line2, city, label ->
                        viewModel.addAddress(title, line1, line2, city, label) { nav.popBackStack() }
                    },
                )
            }
            composable("orders") {
                OrdersScreen(
                    state = state,
                    onBack = { nav.popBackStack() },
                    onOpen = { nav.navigate("tracking/$it") },
                    onSignIn = { nav.navigate("signin") },
                )
            }
            composable("tracking/{orderId}", arguments = listOf(navArgument("orderId") { type = NavType.StringType })) { entry ->
                val id = entry.arguments?.getString("orderId").orEmpty()
                TrackingScreen(orderId = id, state = state, onBack = { nav.popBackStack() }, onLoad = viewModel::loadTracking)
            }
        }
    }
}
