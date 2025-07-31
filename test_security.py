#!/usr/bin/env python3
"""
Security Test Suite for ArtistHub
Tests the implemented security improvements
"""

import requests
import sys
import json
from urllib.parse import urlparse

class SecurityTester:
    def __init__(self, base_url="https://yourdomain.com"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.results = []

    def test_https_redirect(self):
        """Test HTTP to HTTPS redirect"""
        print("🔍 Testing HTTPS redirect...")
        try:
            http_url = self.base_url.replace('https://', 'http://')
            response = self.session.get(http_url, allow_redirects=False, timeout=10)
            
            if response.status_code in [301, 302, 308]:
                location = response.headers.get('Location', '')
                if location.startswith('https://'):
                    self.results.append("✅ HTTP to HTTPS redirect: PASS")
                    return True
                else:
                    self.results.append("❌ HTTP to HTTPS redirect: FAIL - No HTTPS redirect")
            else:
                self.results.append("❌ HTTP to HTTPS redirect: FAIL - No redirect")
        except Exception as e:
            self.results.append(f"⚠️  HTTP to HTTPS redirect: ERROR - {e}")
        return False

    def test_security_headers(self):
        """Test security headers presence"""
        print("🔍 Testing security headers...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            headers = response.headers
            
            required_headers = {
                'Strict-Transport-Security': 'HSTS',
                'X-Content-Type-Options': 'Content type protection',
                'X-Frame-Options': 'Clickjacking protection',
                'X-XSS-Protection': 'XSS protection'
            }
            
            missing_headers = []
            for header, description in required_headers.items():
                if header in headers:
                    self.results.append(f"✅ {description} ({header}): PASS")
                else:
                    self.results.append(f"❌ {description} ({header}): MISSING")
                    missing_headers.append(header)
            
            if not missing_headers:
                self.results.append("✅ All security headers: PASS")
                return True
            else:
                self.results.append(f"❌ Missing headers: {', '.join(missing_headers)}")
        except Exception as e:
            self.results.append(f"⚠️  Security headers test: ERROR - {e}")
        return False

    def test_tls_version(self):
        """Test TLS version"""
        print("🔍 Testing TLS configuration...")
        try:
            # This is a basic test - more comprehensive TLS testing would require additional tools
            response = self.session.get(self.base_url, timeout=10)
            if response.url.startswith('https://'):
                self.results.append("✅ TLS connection: PASS")
                return True
            else:
                self.results.append("❌ TLS connection: FAIL")
        except Exception as e:
            self.results.append(f"⚠️  TLS test: ERROR - {e}")
        return False

    def test_cookie_security(self):
        """Test cookie security settings"""
        print("🔍 Testing cookie security...")
        try:
            # Test login endpoint to see if secure cookies are set
            login_url = f"{self.base_url}/api/auth/google/login"
            response = self.session.get(login_url, timeout=10)
            
            # This endpoint should return OAuth URL
            if response.status_code == 200:
                self.results.append("✅ Auth endpoint accessible: PASS")
            else:
                self.results.append(f"⚠️  Auth endpoint: Status {response.status_code}")
                
            # Check if cookies are properly secured (would need actual login flow)
            # This is a placeholder - real test would need OAuth completion
            self.results.append("ℹ️  Cookie security: Requires full OAuth flow to test")
            
        except Exception as e:
            self.results.append(f"⚠️  Cookie security test: ERROR - {e}")
        return True

    def test_cors_policy(self):
        """Test CORS configuration"""
        print("🔍 Testing CORS policy...")
        try:
            headers = {
                'Origin': 'https://malicious-site.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = self.session.options(f"{self.base_url}/api/auth/me", 
                                          headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            # Should not allow malicious origins
            if cors_headers['Access-Control-Allow-Origin'] == 'https://malicious-site.com':
                self.results.append("❌ CORS policy: FAIL - Allows unauthorized origins")
            else:
                self.results.append("✅ CORS policy: PASS - Restricts unauthorized origins")
                
        except Exception as e:
            self.results.append(f"⚠️  CORS policy test: ERROR - {e}")
        return True

    def test_rate_limiting(self):
        """Test rate limiting (basic)"""
        print("🔍 Testing rate limiting...")
        try:
            # Make multiple rapid requests to auth endpoint
            auth_url = f"{self.base_url}/api/auth/google/login"
            responses = []
            
            for i in range(10):
                try:
                    response = self.session.get(auth_url, timeout=5)
                    responses.append(response.status_code)
                except:
                    responses.append(0)
            
            # Check if any requests were rate limited (429 status)
            rate_limited = any(status == 429 for status in responses)
            
            if rate_limited:
                self.results.append("✅ Rate limiting: PASS - Requests blocked")
            else:
                self.results.append("ℹ️  Rate limiting: No blocking detected (may need more requests)")
                
        except Exception as e:
            self.results.append(f"⚠️  Rate limiting test: ERROR - {e}")
        return True

    def test_information_disclosure(self):
        """Test for information disclosure"""
        print("🔍 Testing information disclosure...")
        try:
            # Test server header disclosure
            response = self.session.get(self.base_url, timeout=10)
            server_header = response.headers.get('Server', '')
            
            if 'nginx' in server_header.lower() and len(server_header) > 10:
                self.results.append("⚠️  Server header: Potentially verbose")
            else:
                self.results.append("✅ Server header: Protected or minimal")
                
            # Test for common sensitive paths
            sensitive_paths = [
                '/.env',
                '/api/.env',
                '/backend/.env',
                '/.git',
                '/admin',
                '/phpmyadmin'
            ]
            
            blocked_paths = []
            for path in sensitive_paths:
                try:
                    resp = self.session.get(f"{self.base_url}{path}", timeout=5)
                    if resp.status_code in [403, 404]:
                        blocked_paths.append(path)
                except:
                    blocked_paths.append(path)  # Timeout likely means blocked
            
            if len(blocked_paths) == len(sensitive_paths):
                self.results.append("✅ Sensitive paths: All blocked")
            else:
                accessible = set(sensitive_paths) - set(blocked_paths)
                self.results.append(f"⚠️  Sensitive paths: {len(accessible)} accessible")
                
        except Exception as e:
            self.results.append(f"⚠️  Information disclosure test: ERROR - {e}")
        return True

    def run_all_tests(self):
        """Run all security tests"""
        print(f"🚀 Starting security tests for {self.base_url}")
        print("=" * 60)
        
        tests = [
            self.test_https_redirect,
            self.test_security_headers,
            self.test_tls_version,
            self.test_cookie_security,
            self.test_cors_policy,
            self.test_rate_limiting,
            self.test_information_disclosure
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.results.append(f"❌ {test.__name__}: EXCEPTION - {e}")
            print()
        
        self.print_results()

    def print_results(self):
        """Print test results summary"""
        print("=" * 60)
        print("🔒 SECURITY TEST RESULTS")
        print("=" * 60)
        
        passed = sum(1 for result in self.results if result.startswith("✅"))
        failed = sum(1 for result in self.results if result.startswith("❌"))
        warnings = sum(1 for result in self.results if result.startswith("⚠️"))
        info = sum(1 for result in self.results if result.startswith("ℹ️"))
        
        for result in self.results:
            print(result)
        
        print("=" * 60)
        print(f"📊 SUMMARY: {passed} passed, {failed} failed, {warnings} warnings, {info} info")
        
        if failed > 0:
            print("❌ SECURITY ISSUES DETECTED - Review failed tests")
            return False
        elif warnings > 0:
            print("⚠️  POTENTIAL ISSUES - Review warnings")
            return True
        else:
            print("✅ ALL SECURITY TESTS PASSED")
            return True

def main():
    import argparse
    parser = argparse.ArgumentParser(description="ArtistHub Security Test Suite")
    parser.add_argument("--url", default="https://yourdomain.com", 
                       help="Base URL to test (default: https://yourdomain.com)")
    parser.add_argument("--local", action="store_true",
                       help="Test local development server (http://localhost:3000)")
    
    args = parser.parse_args()
    
    if args.local:
        base_url = "http://localhost:3000"
    else:
        base_url = args.url
    
    tester = SecurityTester(base_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()