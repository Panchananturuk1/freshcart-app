package com.freshcart.android

import android.app.Application

class FreshCartApp : Application() {
    lateinit var repository: FreshCartRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = FreshCartRepository(this)
    }
}
