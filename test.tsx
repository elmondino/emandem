import { render, screen, fireEvent } from '@testing-library/react';
import { BasketProvider } from '@/context/BasketContext';
import StoreClient from '@/components/StoreClient';
import { locales } from '@/lib/locale';
import { Product } from '@/lib/products';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    redirect: jest.fn(),
    notFound: jest.fn(),
}));

const mockProducts: Product[] = [
    { id: 1, name: { uk: 'Item 1', us: 'Item 1' }, price: { gbp: 10.00, usd: 12.99 }, stock: 10 },
    { id: 2, name: { uk: 'Item 2', us: 'Item 2' }, price: { gbp: 20.00, usd: 25.99 }, stock: 10 },
    { id: 3, name: { uk: 'Item 3', us: 'Item 3' }, price: { gbp: 30.00, usd: 38.99 }, stock: 10 },
    { id: 4, name: { uk: 'Item 4', us: 'Item 4' }, price: { gbp: 40.00, usd: 51.99 }, stock: 10 },
];

beforeEach(() => {
    // Return a never-resolving promise so the deferred more-products fetch
    // does not trigger state updates during synchronous test assertions.
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
});

function renderStore() {
    return render(
        <BasketProvider>
            <StoreClient initialProducts={mockProducts} locale={locales.uk} localeKey="uk" />
        </BasketProvider>
    );
}

describe('Home', () => {
    it('renders an empty basket', () => {
        renderStore();

        const basketButton = screen.getByRole('button', {
            name: /Basket:/i,
        });

        expect(basketButton).toHaveTextContent('Basket: 0 items');
    });

    it('renders a basket with 1 item', () => {
        renderStore();

        const buttons = screen.getAllByRole('button', {
            name: /Add to basket/i,
        });

        fireEvent.click(buttons[0]);

        const basketButton = screen.getByRole('button', {
            name: /Basket:/i,
        });

        expect(basketButton).toHaveTextContent(/Basket: 1 item$/);
    });

    it('renders a basket with 1 of item 1 and 2 of item 2', () => {
        renderStore();

        const buttons = screen.getAllByRole('button', {
            name: /Add to basket/i,
        });

        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        fireEvent.click(buttons[1]);

        const basketButton = screen.getByRole('button', {
            name: /Basket:/i,
        });

        expect(basketButton).toHaveTextContent(/Basket: 2 items$/);
    });
});
