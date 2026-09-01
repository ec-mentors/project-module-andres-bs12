package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAuthFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    private GoogleAuthFilter filter;
    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        filter = new GoogleAuthFilter(jwtTokenProvider, userRepository);
        sampleUserId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(sampleUserId);
        sampleUser.setEmail("test@example.com");
        sampleUser.setRole("USER");
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_setsAuthentication_whenBearerTokenIsValid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/entry/" + sampleUserId);
        request.addHeader("Authorization", "Bearer valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.validateTokenAndGetUserId("valid-jwt")).thenReturn(sampleUserId);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertInstanceOf(UserPrincipal.class, authentication.getPrincipal());
        assertEquals(sampleUserId, ((UserPrincipal) authentication.getPrincipal()).getId());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_doesNotAuthenticate_whenAuthorizationHeaderIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/entry/" + sampleUserId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtTokenProvider);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_doesNotAuthenticate_whenTokenIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/entry/" + sampleUserId);
        request.addHeader("Authorization", "Bearer bad-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.validateTokenAndGetUserId("bad-jwt")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(userRepository);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_clearsContext_whenTokenValidationThrows() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/entry/" + sampleUserId);
        request.addHeader("Authorization", "Bearer boom");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.validateTokenAndGetUserId("boom")).thenThrow(new RuntimeException("invalid signature"));

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_skipsJwtValidation_onGoogleAuthEndpoint() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/user/auth/google");
        request.addHeader("Authorization", "Bearer anything");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verifyNoInteractions(jwtTokenProvider);
        verifyNoInteractions(userRepository);
        verify(filterChain).doFilter(request, response);
    }
}
