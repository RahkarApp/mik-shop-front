import {ImageResponse} from 'next/og';
import {getServerTenantId,getServerStoreHost} from '@/services/tenantResolver';
import {getSiteConfig} from '@/services/siteConfigService';
export const size={width:64,height:64};export const contentType='image/png';
export default async function Icon(){let name='ف';try{const s=await getSiteConfig(await getServerTenantId(),await getServerStoreHost());name=(s?.branding?.siteName||name).slice(0,1);}catch{}return new ImageResponse(<div style={{width:'100%',height:'100%',background:'#333',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:35}}>{name}</div>,size);}
