package com.project.NutritionTracker.security;

import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@AllArgsConstructor
public class GoogleAuthFilter extends OncePerRequestFilter {

    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String googleIdToken = authHeader.substring(7); // Token batter

            try {
                // verify token
                UserResponseDTO userDTO = userService.verifyAndProcessGoogleToken(googleIdToken);

                Optional<User> userOptional = userRepository.findById(userDTO.id());

                if (userOptional.isPresent()) {
                    UserPrincipal principal = new UserPrincipal(userOptional.get());
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }

        }
        filterChain.doFilter(request, response);
    }

}
