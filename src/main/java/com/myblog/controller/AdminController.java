package com.myblog.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String ADMIN_TOKEN = "admin123";

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (ADMIN_TOKEN.equals(password)) {
            return Map.of("success", true, "token", ADMIN_TOKEN);
        }
        return Map.of("success", false, "error", "密码错误");
    }

    @GetMapping("/check")
    public Map<String, Object> check(HttpServletRequest request) {
        String token = request.getHeader("x-admin-token");
        if (token == null) token = request.getParameter("token");
        if (ADMIN_TOKEN.equals(token)) {
            return Map.of("authenticated", true);
        }
        return Map.of("authenticated", false);
    }
}