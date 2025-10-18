import React, { createContext } from 'react';
import AppState from '../interfaces/AppState';
import AppAction from '../types/AppAction';
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export default AppContext;