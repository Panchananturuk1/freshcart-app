package com.freshcart.android

import android.content.Context
import android.content.SharedPreferences
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import okhttp3.MediaType.Companion.toMediaType
import java.util.concurrent.TimeUnit

interface FreshCartApi {
    @POST("/api/auth/login")
    suspend fun login(@Body body: LoginBody): Response<AuthResponse>

    @POST("/api/auth/register")
    suspend fun register(@Body body: RegisterBody): Response<AuthResponse>

    @GET("/api/auth/session")
    suspend fun session(): SessionResponse

    @POST("/api/auth/logout")
    suspend fun logout(): Response<Unit>

    @GET("/api/categories")
    suspend fun categories(): CategoriesResponse

    @GET("/api/catalog")
    suspend fun catalog(
        @Query("q") query: String? = null,
        @Query("category") category: String? = null,
    ): CatalogResponse

    @GET("/api/catalog/{slug}")
    suspend fun product(@Path("slug") slug: String): ProductDto

    @POST("/api/products/by-ids")
    suspend fun productsByIds(@Body body: Map<String, List<String>>): ProductListResponse

    @GET("/api/addresses")
    suspend fun addresses(): AddressListResponse

    @POST("/api/addresses")
    suspend fun createAddress(@Body body: CreateAddressBody): AddressDto

    @GET("/api/orders")
    suspend fun orders(): OrdersResponse

    @POST("/api/orders")
    suspend fun placeOrder(@Body body: PlaceOrderBody): Response<PlaceOrderResponse>

    @GET("/api/orders/{orderId}/tracking")
    suspend fun tracking(@Path("orderId") orderId: String): TrackingDto
}

class PrefCookieJar(private val prefs: SharedPreferences) : CookieJar {
    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        val stored = loadAll().toMutableMap()
        cookies.forEach { stored["${it.domain}|${it.name}"] = it.toString() }
        prefs.edit().putStringSet("cookies", stored.values.toSet()).apply()
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return loadAll().values.mapNotNull { Cookie.parse(url, it) }.filter { it.matches(url) }
    }

    fun clear() {
        prefs.edit().remove("cookies").apply()
    }

    private fun loadAll(): Map<String, String> {
        val set = prefs.getStringSet("cookies", emptySet()).orEmpty()
        return set.mapIndexed { index, value -> index.toString() to value }.toMap()
    }
}

fun createApi(context: Context): Pair<FreshCartApi, PrefCookieJar> {
    val prefs = context.getSharedPreferences("freshcart_session", Context.MODE_PRIVATE)
    val cookieJar = PrefCookieJar(prefs)
    val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }
    val client = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .addInterceptor { chain ->
            chain.proceed(
                chain.request().newBuilder()
                    .header("Accept", "application/json")
                    .header("User-Agent", "FreshCart-Android/${BuildConfig.VERSION_NAME}")
                    .build(),
            )
        }
        .addInterceptor(logging)
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()
    val json = Json { ignoreUnknownKeys = true; isLenient = true; encodeDefaults = true }
    val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL.trimEnd('/') + "/")
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
    return retrofit.create(FreshCartApi::class.java) to cookieJar
}

fun Json.encodeCart(items: List<CartItem>): String = encodeToString(items.map { CartLine(it.productId, it.quantity) })
fun Json.decodeCart(raw: String?): List<CartItem> {
    if (raw.isNullOrBlank()) return emptyList()
    return runCatching { decodeFromString<List<CartLine>>(raw).map { CartItem(it.productId, it.quantity) } }.getOrDefault(emptyList())
}
