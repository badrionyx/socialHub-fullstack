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

         String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response); // pass to next filter
            return; 
        }

        // It removes "Bearer" (7 chars) to get just the token
        String token = authHeader.substring(7);

        if (jwtService.isTokenValid(token)) {

            String email = jwtService.extractEmail(token);

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                    email,       
                    null,        
                    new ArrayList<>() 
                );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }
}