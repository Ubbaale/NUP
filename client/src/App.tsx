import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Regions from "@/pages/Regions";
import RegionDetail from "@/pages/RegionDetail";
import ChapterDetail from "@/pages/ChapterDetail";
import Conferences from "@/pages/Conferences";
import ConferenceDetail from "@/pages/ConferenceDetail";
import News from "@/pages/News";
import Store from "@/pages/Store";
import Membership from "@/pages/Membership";
import Donate from "@/pages/Donate";
import Blog from "@/pages/Blog";
import BlogPostDetail from "@/pages/BlogPostDetail";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import PrintfulAdmin from "@/pages/PrintfulAdmin";
import SongsAdmin from "@/pages/SongsAdmin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/regions" component={Regions} />
      <Route path="/regions/:slug" component={RegionDetail} />
      <Route path="/chapters/:slug" component={ChapterDetail} />
      <Route path="/conferences" component={Conferences} />
      <Route path="/conferences/:slug" component={ConferenceDetail} />
      <Route path="/news" component={News} />
      <Route path="/store" component={Store} />
      <Route path="/membership" component={Membership} />
      <Route path="/donate" component={Donate} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-tracking" component={OrderTracking} />
      <Route path="/admin/printful" component={PrintfulAdmin} />
      <Route path="/admin/songs" component={SongsAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
