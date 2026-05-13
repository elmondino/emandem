import { render, screen, fireEvent } from '@testing-library/react';
import { BasketProvider } from '@/context/BasketContext';
import StoreClient from '@/components/StoreClient';
import CheckoutPage from '@/app/[locale]/checkout/page';
import { locales } from '@/lib/locale';
import { Product } from '@/lib/products';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    redirect: jest.fn(),
    notFound: jest.fn(),
}));

const mockProducts: Product[] = [
    { id: 1, name: { uk: 'Item 1', us: 'Item 1 US' }, price: { gbp: 10.00, usd: 12.99 }, stock: 10 },
    { id: 2, name: { uk: 'Item 2', us: 'Item 2 US' }, price: { gbp: 20.00, usd: 25.99 }, stock: 10 },
    { id: 3, name: { uk: 'Item 3', us: 'Item 3 US' }, price: { gbp: 30.00, usd: 38.99 }, stock: 10 },
    { id: 4, name: { uk: 'Item 4', us: 'Item 4 US' }, price: { gbp: 40.00, usd: 51.99 }, stock: 10 },
];

beforeEach(() => {
    // Return a never-resolving promise so the deferred more-products fetch
    // does not trigger state updates during synchronous test assertions.
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
});

function renderStore(locale: 'uk' | 'us' = 'uk') {
    return render(
        <BasketProvider>
            <StoreClient initialProducts={mockProducts} locale={locales[locale]} localeKey={locale} />
        </BasketProvider>
    );
}

function renderCheckout(locale: 'uk' | 'us' = 'uk') {
    return render(
        <BasketProvider>
            <CheckoutPage params={{ locale }} />
        </BasketProvider>
    );
}

describe('Home', () => {
    it('renders basket button with 0 items', () => {
        renderStore();
        const basketButton = screen.getByRole('button', { name: /open basket/i });
        expect(basketButton).toBeInTheDocument();
    });

    it('adds item to basket and updates count badge', () => {
        renderStore();

        const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
        fireEvent.click(addButtons[0]);

        // basket button aria-label updates with count
        expect(screen.getByRole('button', { name: /open basket, 1 item/i })).toBeInTheDocument();
    });

    it('accumulates quantity across multiple adds', () => {
        renderStore();

        const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
        fireEvent.click(addButtons[0]);
        fireEvent.click(addButtons[1]);
        fireEvent.click(addButtons[1]);

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays GBP prices for UK locale', () => {
        renderStore('uk');
        expect(screen.getByText('£10.00')).toBeInTheDocument();
    });

    it('displays USD prices for US locale', () => {
        renderStore('us');
        expect(screen.getByText('$12.99')).toBeInTheDocument();
    });
});

describe('Checkout', () => {
    it('shows empty basket message when no items added', () => {
        renderCheckout();
        expect(screen.getByText('Your basket is empty.')).toBeInTheDocument();
    });

    it('shows items and total after adding to basket', () => {
        render(
            <BasketProvider>
                <StoreClient initialProducts={mockProducts} locale={locales.uk} localeKey="uk" />
                <CheckoutPage params={{ locale: 'uk' }} />
            </BasketProvider>
        );

        const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
        fireEvent.click(addButtons[0]);
        fireEvent.click(addButtons[0]);

        expect(screen.getAllByText('Item 1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2').length).toBeGreaterThan(0);
        expect(screen.getByText('Place order')).toBeInTheDocument();
    });

    it('removes item from basket when remove button clicked', () => {
        render(
            <BasketProvider>
                <StoreClient initialProducts={mockProducts} locale={locales.uk} localeKey="uk" />
                <CheckoutPage params={{ locale: 'uk' }} />
            </BasketProvider>
        );

        const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
        fireEvent.click(addButtons[0]);

        // Both the drawer and checkout page have a remove button; click the checkout one
        const removeButtons = screen.getAllByRole('button', { name: /Remove Item 1/i });
        fireEvent.click(removeButtons[removeButtons.length - 1]);

        expect(screen.getByText('Your basket is empty.')).toBeInTheDocument();
    });
});
