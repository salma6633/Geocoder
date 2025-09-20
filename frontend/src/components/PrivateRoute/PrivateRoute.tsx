import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface PrivateRouteProps {
  redirectPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
