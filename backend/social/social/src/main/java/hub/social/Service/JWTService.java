package hub.social.Service;

import java.util.Date;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JWTService {
	private static final String SECRET = "SocialHub_SecretKey_24680_stampValue";
	private static final long EXPIRY = 7 * 24 * 60 * 60 * 1000L;

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(SECRET.getBytes());
	}
	
	public String generateToken(Long userId, String email) {
		return Jwts.builder().subject(email)
				.claim("user_id", userId)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis()+EXPIRY))
				.signWith(getSigningKey()).compact();
	}
	
	public String extractEmail(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build().parseSignedClaims(token)
				.getPayload().getSubject();
	}
	
	public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();                    
        return claims.get("userId", Long.class);
    }

	public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;   
        } catch (JwtException e) {
            return false;  //  fake or expired
        }
	}
}
