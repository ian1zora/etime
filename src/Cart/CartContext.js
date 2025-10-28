import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const initialState = {
  items: [], // {product, quantity}
  peopleCount: 1
};

function reducer(state, action) {
  switch(action.type) {
    case 'SET_PEOPLE':
      return {...state, peopleCount: action.payload};
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find(i => i.product.id === product.id);
      const maxPerPerson = 4;
      const allowedMax = maxPerPerson * state.peopleCount;
      const currentTotal = state.items.reduce((s,i) => s + i.quantity, 0);
      const newTotal = currentTotal + quantity;

      if (newTotal > allowedMax) {
        // devolver un error que UI mostrará
        return {...state, lastError: `Máximo ${allowedMax} artículos para ${state.peopleCount} personas`};
      }

      if (existing) {
        const updated = state.items.map(i => i.product.id === product.id ? {...i, quantity: i.quantity + quantity} : i);
        return {...state, items: updated, lastError: null};
      } else {
        return {...state, items: [...state.items, {product, quantity}], lastError: null};
      }
    }
    case 'UPDATE_QTY': {
      const { productId, quantity } = action.payload;
      const maxPerPerson = 4;
      const allowedMax = maxPerPerson * state.peopleCount;
      const otherTotal = state.items.filter(i => i.product.id !== productId).reduce((s,i) => s + i.quantity, 0);
      if (otherTotal + quantity > allowedMax) {
        return {...state, lastError: `Máximo ${allowedMax} artículos para ${state.peopleCount} personas`};
      }
      const updated = state.items.map(i => i.product.id === productId ? {...i, quantity} : i);
      return {...state, items: updated, lastError: null};
    }
    case 'REMOVE_ITEM':
      return {...state, items: state.items.filter(i => i.product.id !== action.payload)};
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <CartContext.Provider value={{state, dispatch}}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext);
}
