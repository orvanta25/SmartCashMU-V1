import LoginScreen from './components/loginScreen'
import {Route,Routes,HashRouter} from "react-router-dom"
import POSPage from './components/pos'
import { AuthProvider } from './components/auth/auth-context'

import DashboardUserLayout from './components/dashboard_user_layout'
import DashboardPage from './components/dashboard_user_pages/DashboardContent/page'
import Unauthorized from './unauthorized'
import SalesPage from './components/dashboard_user_pages/sales/pos-list/page'
import Invoiceform from './components/dashboard_user_pages/purchasesProvider/add-invoice/page'
import InventoryFormPage from './components/dashboard_user_pages/stock/inventory-form/page'
import ProductsPage from './components/dashboard_user_pages/products/new/page'
import NewCategoryPage from './components/dashboard_user_pages/categories/new/page'
import CategoriesListPage from './components/dashboard_user_pages/categories/list/page'
import Banned from './banned'
import ProductListPage from './components/dashboard_user_pages/products/list/page'
import ACCFormPage from './components/dashboard_user_pages/stock/acc-form/page'
import DiscrepanciesPage from './components/dashboard_user_pages/stock/discrepancies/page'
import LoadTypePage from './components/dashboard_user_pages/loadManagment/loadType/page'
import LoadFormPage from './components/dashboard_user_pages/loadManagment/loadForm/page'
import LoadListPage from './components/dashboard_user_pages/loadManagment/loadForm/list/page'
import PaymentsPage from './components/dashboard_user_pages/purchasesProvider/payments/page'
import AddTicketRestoPage from './components/dashboard_user_pages/TicketResto/add/page'
import TicketRestoListPage from './components/dashboard_user_pages/TicketResto/list/page'

import NotFound from './notfound'
import { ToastContainer } from 'react-toastify'
import BalanceSettingsPage from './components/dashboard_user_pages/configuration/balance/page'
import ImprimantePage from './components/dashboard_user_pages/configuration/imprimante/page'
import AddNewInvoicePage from './components/dashboard_user_pages/provider-Invoice/invoice/add/page'
import EditInvoicePage from './components/dashboard_user_pages/provider-Invoice/invoice/edit/page'
import AddUserPage from './components/dashboard_user_pages/configuration/user-management/page'
import UserListPage from './components/dashboard_user_pages/configuration/user-management/list/page'
import ImpressionZjourPage from './components/dashboard_user_pages/impression/page'
import AddStorepage from './components/dashboard_user_pages/StoreManagement/store/page'
import AddResponsiblepage from './components/dashboard_user_pages/StoreManagement/responsible/page'
import ListClientPage from './components/dashboard_user_pages/client/add-client/list/page'
import ListProviderPage from './components/dashboard_user_pages/provider/list/page'
import StockAccListPage from './components/dashboard_user_pages/inventory/acc/list/page'
import ACCPage from './components/dashboard_user_pages/inventory/acc/page'
import DeadlinesHistoryPage from './components/dashboard_user_pages/Deadlines/history/page'
import MonthlyReportPage from './components/dashboard_user/Monthly-report/Monthly-reportPage'
import BalanceConfigListPage from './components/dashboard_user_pages/configuration/balance/list/page'
import PrinterListPage from './components/dashboard_user_pages/configuration/imprimante/list/page'
import ListStorepage from './components/dashboard_user_pages/StoreManagement/store/list/page'
import ListResponsiblepage from './components/dashboard_user_pages/StoreManagement/responsible/list/page'
import AddClientPage from './components/dashboard_user_pages/client/add-client/page'
import AddProviderPage from './components/dashboard_user_pages/provider/page'
import ProductEditPage from './components/dashboard_user_pages/products/edit/page'
import ProductDetailsPage from './components/dashboard_user_pages/products/details/[id]/page'
import StockListPage from './components/dashboard_user_pages/inventory/stock/list/page'
import InvoiceDetailsPage from './components/dashboard_user_pages/purchasesProvider/details/[id]/page'
import EditPage from './components/dashboard_user_pages/purchasesProvider/edit/[id]/page'
import ProfilePage from './components/dashboard_user_pages/profile/page'
import InvoicePage from './components/dashboard_user_pages/provider-Invoice/invoice/page'
import EditUserPage from './components/dashboard_user_pages/configuration/user-management/edit/[id]/page'
import UserDetailsPage from './components/dashboard_user_pages/configuration/user-management/[id]/page'
import SettingsPage from './components/dashboard_user_pages/settings/page'
import BusinessTypePage from './components/dashboard_user_pages/profile/type/page'
import VenteListByCommandePage from './components/dashboard_user_pages/sales/pos-list/[commandeId]/page'
import StockPage from './components/dashboard_user_pages/inventory/stock/page'
import VariantFamilyForm from './components/dashboard_user_pages/variant/VariantFamilyForm'
import VariantFamilyList from './components/dashboard_user_pages/variant/VariantFamilyList'
import VariantValueForm from './components/dashboard_user_pages/variant/VariantValueForm'
import VariantValueList from './components/dashboard_user_pages/variant/VariantValueList'
import { RemiseConfiguration } from './components/dashboard_user/PaymentRemise/RemiseConfiguration'
function App(): React.JSX.Element {

  return (
    
     <HashRouter>

        <Routes>

          {/* Login Route */}
          <Route  path="/" element={<LoginScreen />} />
          
          <Route path='/pos' element={<POSWrapper  />} />
          
          {/* Dashboard User Routes */}
        <Route path="/dashboard_user" element={<DashboardUserLayout />}>
          <Route index element={<DashboardPage />} />
          {/*profile */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile/type" element={<BusinessTypePage />} />
          
          <Route path="sales/pos-list" element={<SalesPage />} />
          <Route path="sales/pos-list/:id" element={<VenteListByCommandePage />} />
          {/*stock */}

          <Route path='categories/new' element={<NewCategoryPage/>}/>
          <Route path='categories/list' element={<CategoriesListPage/>} />
          
          <Route path="stock/inventory-form" element={<InventoryFormPage />} />
          <Route path='stock/acc-form' element={<ACCFormPage/>} />
          <Route path='stock/discrepancies' element={<DiscrepanciesPage/>} />

          {/*inventory */}
          <Route path='inventory/acc/list' element={<StockAccListPage/>}/>
          <Route path='inventory/acc' element={<ACCPage/>}/>
          <Route path='inventory/stock/list' element={<StockListPage/>}/>
          <Route path='inventory/stock' element={<StockPage/>}/>
          
          
          {/*product */}
          <Route path="products/new" element={<ProductsPage />} />
          <Route path="products/list" element={<ProductListPage />} />
          <Route path="products/edit" element={<ProductEditPage />} />
          <Route path="products/details/:id" element={<ProductDetailsPage />} />

          {/* Variants routes */}
          <Route path='variant/families/new' element={<VariantFamilyForm />} />
          <Route path='variant/families/list' element={<VariantFamilyList />} />
          <Route path='variant/families' element={<VariantFamilyList />} />
          <Route path='variant/values/new' element={<VariantValueForm />} />
          <Route path='variant/values/list' element={<VariantValueList />} />
          <Route path='variant/values' element={<VariantValueList />} />
         


          {/*Charges */}
          <Route path='loadManagment/loadType' element={<LoadTypePage/>} />
          <Route path='loadManagment/loadForm' element={<LoadFormPage/>} />
          <Route path='loadManagment/loadForm/list' element={<LoadListPage/>} />

          {/*factures */}
          <Route path="purchasesProvider/add-invoice" element={<Invoiceform />} />
          <Route path="purchasesProvider/details/:id" element={<InvoiceDetailsPage />} />
          <Route path='purchasesProvider/edit/:id' element={<EditPage/>} />
          <Route path='purchasesProvider/payments' element={<PaymentsPage/>} />

          {/*deadlines */}
          <Route path='Deadlines/history' element={<DeadlinesHistoryPage/>}/>

          {/*declaratio mensuelle */}
          <Route path='Monthly-report' element={<MonthlyReportPage/>}/>

          {/*ticket resto */}
          <Route path='TicketResto/add' element={<AddTicketRestoPage/>}/>
          <Route path='TicketResto/list' element={<TicketRestoListPage/>}/>
          
          {/*configuration */}
          <Route path='configuration/balance' element={<BalanceSettingsPage/>}/>
          <Route path='configuration/balance/list' element={<BalanceConfigListPage/>}/>
          <Route path='configuration/imprimante' element={<ImprimantePage/>}/>
          <Route path='configuration/imprimante/list' element={<PrinterListPage/>}/>

          <Route path='provider-Invoice/invoice/add' element={<AddNewInvoicePage/>}/>
          <Route path='provider-Invoice/invoice/edit' element={<EditInvoicePage/>}/>
          <Route path='provider-Invoice/invoice' element={<InvoicePage/>}/>

          {/*Marketing & Remise */}
            <Route path="remise/configuration" element={<RemiseConfiguration />} />
          {/*utilisateurs  */}
          <Route path='configuration/user-management' element={<AddUserPage/>}/>
          <Route path='configuration/user-management/list' element={<UserListPage/>}/>
          <Route path='configuration/user-management/edit/:id' element={<EditUserPage/>}/>
          <Route path='configuration/user-management/details/:id' element={<UserDetailsPage/>}/>

          {/*impression */}
          <Route path='impression/Zjour' element={<ImpressionZjourPage/>}/>
         

          {/*magasins */}
          <Route path='StoreManagement/store' element={<AddStorepage/>}/>
          <Route path='StoreManagement/store/list' element={<ListStorepage/>}/>
          <Route path='StoreManagement/responsible' element={<AddResponsiblepage/>}/>
          <Route path='StoreManagement/responsible/list' element={<ListResponsiblepage/>}/>

          {/*client/ fournisseur */}
          <Route path='client/add-client/list' element={<ListClientPage/>}/>
          <Route path='client/add-client' element={<AddClientPage/>}/>
          <Route path='provider/list' element={<ListProviderPage/>}/>
          <Route path='provider' element={<AddProviderPage/>}/>
        </Route>
        
        <Route path='/unauthorized' element={<Unauthorized/>}/>

        <Route path='/banned' element={<Banned/>}/>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      </HashRouter>

  )
}

export default App

function POSWrapper (){
  return (
<AuthProvider>
    <POSPage/>
</AuthProvider>
  )
}