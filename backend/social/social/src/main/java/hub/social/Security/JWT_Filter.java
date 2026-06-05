package hub.social.Security;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
// OncePerRequestFilter = run this code ONCE per every incoming request
public class JWT_Filter extends OncePerRequestFilter {

    private final JWT_Service jwtService;

    public JWT_Filter(JWT_Service jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,    // the incoming request
            HttpServletResponse response,  // the outgoing response
            FilterChain chain)             // the next filter in line
            throws ServletException, IOException {

        // STEP 1: Look for the Authorization header
        // It looks like:  Authorization: Bearer eyJhbGci...
        String authHeader = request.getHeader("Authorization");

        // STEP 2: If no header or doesn't start with "Bearer ", skip
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response); // pass to next filter
            return; // stop here
        }

        // STEP 3: Remove "Bearer " (7 chars) to get just the token
        String token = authHeader.substring(7);

        // STEP 4: Check if token is valid
        if (jwtService.isTokenValid(token)) {

            // STEP 5: Get the email from the token
            String email = jwtService.extractEmail(token);

            // STEP 6: Tell Spring Security "this user is authenticated"
            // This is like showing your ID badge — Spring now trusts this user
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                    email,        // who the user is
                    null,         // password not needed here
                    new ArrayList<>()  // roles (empty for now)
                );

            // Save to Spring's security context for this request
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        // STEP 7: Continue to the actual controller
        chain.doFilter(request, response);
    }
}