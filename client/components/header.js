import Link from 'next/link';

const linkStyle = {
  marginRight: 15
};

const Header = () => (
  <div>
    <Link href="/">
      <a style={linkStyle}>Home</a>
    </Link>
    <Link href="/tasks">
      <a style={linkStyle}>Tasks</a>
    </Link>
    <Link href="/tokens">
      <a style={linkStyle}>Tokens</a>
    </Link>
  </div>
);

export default Header;