import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft, faTableColumns, faUsers, faTrophy, faInbox, faUser, faXmark, faSpinner, faCheck, faRobot, faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Landpage from "./LandPage.jsx"
import Wrapper0 from "./Wrapper0.jsx";
import Wrapper1 from "./Wrapper1.jsx";
import Wrapper2 from "./Wrapper2.jsx";
import Wrapper3 from "./Wrapper3.jsx";
import Wrapper4 from "./Wrapper4.jsx";
import Wrapper5 from "./Wrapper5.jsx";
import Wrapper6 from "./Wrapper6.jsx";
import Wrapper7 from "./Wrapper7.jsx";
import Wrapper8 from "./Wrapper8.jsx";
import Wrapper9 from "./Wrapper9.jsx";
import Logout from "./Wrapper10.jsx";

library.add(faChevronLeft, faTableColumns, faUsers, faTrophy, faInbox, faUser, faXmark, faSpinner, faCheck, faRobot, faMicrophone, faPaperPlane);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    
    <BrowserRouter>
    <Routes>
      
      <Route path="/" element ={<Landpage user={null} team={null}/>}/>
      <Route path="/LandPage/:id" element ={<Wrapper0/>}/>
      <Route path="/MainPage/:id" element ={<Wrapper1/>}/>
      <Route path="/UserPage/:id" element ={<Wrapper2/>}/>
      <Route path="/TeamPage/:id" element ={<Wrapper3/>}/>
      <Route path="/AllRequestsPage/:id" element ={<Wrapper4/>}/>
      <Route path="/ProfilePage/:id" element ={<Wrapper5/>}/>
      <Route path="/NewRequestsPage/:id" element ={<Wrapper6/>}/>
       
      <Route path="/FUserPage/:id/:play/:loca" element ={<Wrapper7/>}/>
      <Route path="/FTeamPage/:id/:play/:loca" element ={<Wrapper8/>}/>
      <Route path="/ChatPage/:sId/:rId" element ={<Wrapper9/>}/>
      <Route path="/logout" element ={<Logout/>}/>
    </Routes>
    </BrowserRouter>
    
  </React.StrictMode>
);

