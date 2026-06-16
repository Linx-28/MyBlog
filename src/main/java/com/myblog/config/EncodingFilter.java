package com.myblog.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class EncodingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setCharacterEncoding(StandardCharsets.UTF_8.name());
        httpResponse.setContentType("text/html;charset=UTF-8");
        chain.doFilter(request, response);
    }
}