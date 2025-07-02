
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Inertia } from '@inertiajs/inertia';

const CartContext = createContext();

export const CartProvider = ({ children, initialCartCount = 0, userId }) => {
    const [cartCount, setCartCount] = useState(initialCartCount);
    const [cartProducts, setCartProducts] = useState([]); // Aquí almacenamos los productos del carrito

    // Función para actualizar el carrito
    const updateCartCount = (count) => {
        setCartCount(count);
    };

    // Función para cargar los productos del carrito desde la base de datos usando Inertia
    const loadCart = () => {
        console.log('Productos en el carrito:', cartProducts);
        Inertia.get(`/cart/${userId}`, {}, {
            onSuccess: (response) => {
                const { totalCount, products } = response.props; // Asegúrate de que la respuesta tenga estos valores
                setCartCount(totalCount);
                setCartProducts(products);
            },
            onError: (error) => {
                console.error("Error al cargar el carrito", error);
            }
        });
    };

    useEffect(() => {
        if (userId) {
            loadCart(); // Cargar los productos cuando el componente se monta
        }
    }, [userId]);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount, cartProducts }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    return useContext(CartContext);
};












/* -----------------------------------------------------



// Hook para consumir el contexto en cualquier componente
export const useCart = () => {
    return useContext(CartContext);
};

// Proveedor del contexto
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        items: [],
        quantity: 0,
        total: 0,  // Total agregado para poder manejar el valor total
    });

    // Función para agregar un producto al carrito
    const addToCart = (item) => {
        setCart((prevState) => {
            const existingItem = prevState.items.find((cartItem) => cartItem.id === item.id);

            let newItems;
            if (existingItem) {
                // Si el producto ya está, incrementamos la cantidad
                newItems = prevState.items.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            } else {
                // Si el producto no está en el carrito, lo agregamos
                newItems = [...prevState.items, { ...item, quantity: 1 }];
            }

            const newQuantity = newItems.reduce((acc, item) => acc + item.quantity, 0); // Actualizamos la cantidad total
            const newTotal = newItems.reduce((acc, item) => acc + item.precio * item.quantity, 0); // Calculamos el total

            return { items: newItems, quantity: newQuantity, total: newTotal };
        });
    };

    // Función para eliminar un producto del carrito
    const removeFromCart = (e, productId) => {
        e.preventDefault();  // Evita la recarga de la página en un evento de clic
        setCart((prevState) => {
            const updatedItems = prevState.items.filter(item => item.id !== productId);
            const newQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);  // Actualizamos la cantidad total
            const newTotal = updatedItems.reduce((acc, item) => acc + item.precio * item.quantity, 0);  // Calculamos el total
    
            return { items: updatedItems, quantity: newQuantity, total: newTotal };
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};
 */