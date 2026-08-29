package com.freshcart.android

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

@Serializable
data class SessionUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String = "customer",
)

@Serializable
data class AuthResponse(val user: SessionUser? = null, val message: String? = null)

@Serializable
data class SessionResponse(val user: SessionUser? = null)

@Serializable
data class CategoryDto(
    val id: String,
    val name: String,
    val emoji: String = "",
    val description: String = "",
)

@Serializable
data class CategoriesResponse(val items: List<CategoryDto> = emptyList())

@Serializable
data class ProductDto(
    val id: String,
    val slug: String,
    val name: String,
    val brand: String = "",
    val categoryId: String = "",
    val price: Int,
    val compareAtPrice: Int? = null,
    val rating: Double = 0.0,
    val stock: Int = 0,
    val eta: String = "10 mins",
    val unit: String = "",
    val tags: JsonElement? = null,
    val description: String = "",
    val imagePath: String = "",
) {
    val tagList: List<String>
        get() = when (tags) {
            is JsonArray -> tags.jsonArray.mapNotNull { it.jsonPrimitive.contentOrNull }
            else -> emptyList()
        }

    val hasImage: Boolean get() = imagePath.isNotBlank()
}

@Serializable
data class CatalogResponse(val count: Int = 0, val items: List<ProductDto> = emptyList())

@Serializable
data class ProductListResponse(val items: List<ProductDto> = emptyList())

@Serializable
data class AddressDto(
    val id: String,
    val label: String,
    val title: String,
    val line1: String,
    val line2: String,
    val city: String,
    val eta: String,
    val isDefault: Boolean = false,
)

@Serializable
data class AddressListResponse(val items: List<AddressDto> = emptyList())

@Serializable
data class CreateAddressBody(
    val label: String,
    val title: String,
    val line1: String,
    val line2: String,
    val city: String,
    val eta: String = "12 mins",
    val isDefault: Boolean = false,
)

@Serializable
data class CartLine(val productId: String, val quantity: Int)

@Serializable
data class PlaceOrderBody(
    val addressId: String? = null,
    val paymentMethod: String,
    val items: List<CartLine>,
)

@Serializable
data class PlaceOrderResponse(val orderId: String? = null, val message: String? = null)

@Serializable
data class OrderDto(
    val id: String? = null,
    val displayId: String = "",
    val status: String = "",
    val etaMinutes: Int = 0,
    val total: Int = 0,
    val paymentMethod: String = "",
    val address: AddressDto? = null,
)

@Serializable
data class OrdersResponse(val items: List<OrderDto> = emptyList())

@Serializable
data class RiderDto(
    val name: String? = null,
    val phoneMasked: String? = null,
    val vehicle: String? = null,
)

@Serializable
data class TimelineStepDto(
    val status: String,
    val time: String = "",
    val note: String = "",
)

@Serializable
data class TrackingDto(
    val id: String,
    val status: String,
    val etaMinutes: Int = 0,
    val addressLabel: String = "",
    val rider: RiderDto? = null,
    val timeline: List<TimelineStepDto> = emptyList(),
    val message: String? = null,
)

@Serializable
data class LoginBody(val email: String, val password: String)

@Serializable
data class RegisterBody(
    val fullName: String,
    val email: String,
    val phone: String,
    val password: String,
)

data class CartItem(val productId: String, val quantity: Int)
