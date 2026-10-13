import {Routes,Route,Navigate} from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Analysis from './pages/Analysis/Analysis';

export default function App(){
  return <Routes>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/dashboard" element={<Navigate to="/" replace/>}/>
    <Route path="/analysis/:id" element={<Analysis/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
