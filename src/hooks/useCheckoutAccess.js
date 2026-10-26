'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {useSiteConfig} from './useSiteConfig';
import {useShopActions} from './useShopActions';
import {demoHref} from '@/utils/demoRoute';
import {authErrorMessage} from '@/utils/auth';

/** Only a profile response confirms access; a service failure must not look like logout. */
export function useCheckoutAccess() {
  const {tenantId, loading:configLoading} = useSiteConfig();
  const {getProfile} = useShopActions();
  const router = useRouter();
  const pathname = usePathname();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({tenantId:null, status:'checking', profile:null, error:''});
  const mounted = useRef(true);
  useEffect(() => {mounted.current = true;return () => {mounted.current = false;};}, []);
  const redirectToLogin = useCallback(() => {
    if (!mounted.current) return;
    setState({tenantId, status:'redirecting', profile:null, error:''});
    router.replace(demoHref('/login?next=%2Fcheckout', pathname));
  }, [tenantId, router, pathname]);

  useEffect(() => {
    if (!tenantId || configLoading) return;
    let active = true;
    setState({tenantId, status:'checking', profile:null, error:''});
    getProfile().then(profile => {
      if (!active) return;
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Invalid profile response');
      setState({tenantId, status:'allowed', profile, error:''});
    }).catch(error => {
      if (!active) return;
      if (error.status === 401) redirectToLogin();
      else setState({tenantId, status:'error', profile:null, error:authErrorMessage(error,'checkout')});
    });
    return () => {active = false;};
  }, [tenantId, configLoading, getProfile, redirectToLogin, attempt]);

  const current = !configLoading && state.tenantId === tenantId;
  return {
    status:current ? state.status : 'checking', profile:current ? state.profile : null,
    error:current ? state.error : '', redirectToLogin, retry:() => setAttempt(value => value + 1),
  };
}
