import { Link } from 'rimble-ui';

const linkStyle = {
  marginRight: 15
};

const Header = () => (
  <div>
    <Link href="/"> Home </Link>
    <Link href="/tasks" ml={3}> Tasks </Link>
    <Link href="/rewards" ml={3}> Rewards </Link>
    <Link href="/tokens" ml={3}> Tokens </Link>
  </div>
);

export default Header;