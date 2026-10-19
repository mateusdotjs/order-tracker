package com.example.api.auth;

import com.example.api.auth.dto.AuthResponse;

record LoginSuccess(AuthResponse user, String accessToken) {
}
