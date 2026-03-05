import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
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
import Songs from "@/pages/Songs";
import EventsAdmin from "@/pages/EventsAdmin";
import MembershipAdmin from "@/pages/MembershipAdmin";
import ChaptersAdmin from "@/pages/ChaptersAdmin";
import StoreAdmin from "@/pages/StoreAdmin";
import MembershipTiers from "@/pages/MembershipTiers";
import VirtualEvents from "@/pages/VirtualEvents";
import VirtualEventDetail from "@/pages/VirtualEventDetail";
import CampaignsList from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";
import Auctions from "@/pages/Auctions";
import AuctionDetail from "@/pages/AuctionDetail";
import ProductDetail from "@/pages/ProductDetail";
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
      <Route path="/store/:slug" component={ProductDetail} />
      <Route path="/membership" component={Membership} />
      <Route path="/donate" component={Donate} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-tracking" component={OrderTracking} />
      <Route path="/admin/printful" component={PrintfulAdmin} />
      <Route path="/songs" component={Songs} />
      <Route path="/admin/songs" component={SongsAdmin} />
      <Route path="/admin/events" component={EventsAdmin} />
      <Route path="/admin/membership" component={MembershipAdmin} />
      <Route path="/admin/chapters" component={ChaptersAdmin} />
      <Route path="/admin/store" component={StoreAdmin} />
      <Route path="/membership-tiers" component={MembershipTiers} />
      <Route path="/events" component={VirtualEvents} />
      <Route path="/events/:slug" component={VirtualEventDetail} />
      <Route path="/campaigns" component={CampaignsList} />
      <Route path="/campaigns/:slug" component={CampaignDetail} />
      <Route path="/auctions" component={Auctions} />
      <Route path="/auctions/:slug" component={AuctionDetail} />
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
          <main className="flex-1 pb-20 lg:pb-0">
            <Router />
          </main>
          <div className="hidden lg:block">
            <Footer />
          </div>
          <MobileNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
