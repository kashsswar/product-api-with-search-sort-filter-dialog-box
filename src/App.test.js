import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome text', () => {
  render(<App />);
  const welcomeText = screen.getByText(/Welcome to My MERN App/i);
  expect(welcomeText).toBeInTheDocument();
});
