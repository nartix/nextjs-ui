/**
 * Extracts and returns the client IP address from the request headers.
 * If the IP address is an IPv4 address, it converts it to an IPv6-mapped IPv4 address.
 * If the IP address is invalid, returns a default IPv6 address.
 * Compatible with Next.js Edge Runtime middleware.
 *
 * @param headers - The Headers object from NextRequest.
 * @returns The client IP address as a string.
 */
export function getClientIp(headers: Headers): string {
  // Attempt to get the IP from 'x-forwarded-for' header
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // 'x-forwarded-for' can contain multiple IPs, the first one is the client's IP
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    if (ips.length > 0 && isValidIp(ips[0])) {
      const clientIp = ips[0];
      return isIpv4(clientIp) ? convertIpv4ToMappedIpv6(clientIp) : clientIp;
    }
  }

  // Fallback to 'x-real-ip' header
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    const clientIp = xRealIp.trim();
    return isIpv4(clientIp) ? convertIpv4ToMappedIpv6(clientIp) : clientIp;
  }

  // Default IPv6 address if no valid IP is found
  return '::1';
}

/**
 * Converts an IPv4 address to an IPv6-mapped IPv4 address.
 *
 * @param ipv4 - The IPv4 address string to convert.
 * @returns The IPv6-mapped IPv4 address as a string.
 */
export function convertIpv4ToMappedIpv6(ipv4: string): string {
  return `::ffff:${ipv4}`;
}

/**
 * Determines if the given IP address is a valid IPv4 address.
 *
 * @param ip - The IP address string to check.
 * @returns True if the IP is a valid IPv4 address, false otherwise.
 */
export function isIpv4(ip: string): boolean {
  return ipv4Regex.test(ip);
}

/**
 * Validates the IP address format (IPv4, IPv6, or IPv6-mapped IPv4).
 *
 * @param ip - The IP address string to validate.
 * @returns True if the IP is valid, false otherwise.
 */
export function isValidIp(ip: string): boolean {
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv6MappedRegex.test(ip);
}

// Define the IPv4 regex once and reuse it
const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

// Regex for validating standard IPv6 addresses
const ipv6Regex = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;

// Regex for validating IPv6-mapped IPv4 addresses (e.g., ::ffff:172.16.10.60)
const ipv6MappedRegex =
  /^::ffff:(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
