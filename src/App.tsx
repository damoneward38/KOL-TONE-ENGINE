/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext";
import PaywallModal from "@/src/components/PaywallModal";
import Landing from "@/src/pages/Landing";
import Dashboard from "@/src/pages/Dashboard";
import Pricing from "@/src/pages/Pricing";
import Checkout from "@/src/pages/Checkout";
import Login from "@/src/pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PaywallModal />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard defaultTab="emet" />} />
          <Route path="/emet" element={<Dashboard defaultTab="emet" />} />
          <Route path="/ayin" element={<Dashboard defaultTab="ayin" />} />
          <Route path="/nesher" element={<Dashboard defaultTab="nesher" />} />
          <Route path="/ruach" element={<Dashboard defaultTab="ruach" />} />
          <Route path="/kol" element={<Dashboard defaultTab="kol" />} />
          <Route path="/neshima" element={<Dashboard defaultTab="neshima" />} />
          <Route path="/zpe" element={<Dashboard defaultTab="zpe" />} />
          <Route path="/daat" element={<Dashboard defaultTab="daat" />} />
          <Route path="/terminal" element={<Dashboard defaultTab="terminal" />} />
          <Route path="/profiles" element={<Dashboard defaultTab="profiles" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
