// import { render, screen } from '@testing-library/react';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });


import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders Home page with heading', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // Verify if the Home component renders correctly
  const headingElement = screen.getByText(/Enter the Room Id/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders 404 page for invalid route', () => {
  render(
    <MemoryRouter initialEntries={['/invalid-route']}>
      <App />
    </MemoryRouter>
  );
  // Check for 404 page message
  const notFoundElement = screen.getByText(/404 - Page Not Found/i);
  expect(notFoundElement).toBeInTheDocument();
});
