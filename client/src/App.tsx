import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AdminAuthProvider, useAdminAuth } from "@/components/AdminAuthProvider";
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
import StorePolicies from "@/pages/StorePolicies";
import MembershipTiers from "@/pages/MembershipTiers";
import VirtualEvents from "@/pages/VirtualEvents";
import VirtualEventDetail from "@/pages/VirtualEventDetail";
import CampaignsList from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";
import FundraiserPage from "@/pages/FundraiserPage";
import Fundraise from "@/pages/Fundraise";
import Auctions from "@/pages/Auctions";
import AuctionDetail from "@/pages/AuctionDetail";
import ProductDetail from "@/pages/ProductDetail";
import AboutUs from "@/pages/AboutUs";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import RegionAdmin from "@/pages/RegionAdmin";
import RegionDetailAdmin from "@/pages/RegionDetailAdmin";
import MembersAdmin from "@/pages/MembersAdmin";
import ChapterPortal from "@/pages/ChapterPortal";
import RegionPortal from "@/pages/RegionPortal";
import ConferencesAdmin from "@/pages/ConferencesAdmin";
import CampaignsAdmin from "@/pages/CampaignsAdmin";
import BlogAdmin from "@/pages/BlogAdmin";
import DonationsAdmin from "@/pages/DonationsAdmin";
import AuctionsAdmin from "@/pages/AuctionsAdmin";
import MembershipTiersAdmin from "@/pages/MembershipTiersAdmin";
import OrdersAdmin from "@/pages/OrdersAdmin";
import Gallery from "@/pages/Gallery";
import GalleryAdmin from "@/pages/GalleryAdmin";
import NewsletterAdmin from "@/pages/NewsletterAdmin";
import FundraisersAdmin from "@/pages/FundraisersAdmin";
import NewsAdmin from "@/pages/NewsAdmin";
import FallenHeroes from "@/pages/FallenHeroes";
import FallenHeroesAdmin from "@/pages/FallenHeroesAdmin";
import HumanRightsReportsAdmin from "@/pages/HumanRightsReportsAdmin";
import CommunityEventsAdmin from "@/pages/CommunityEventsAdmin";
import Documentaries from "@/pages/Documentaries";
import DocumentariesAdmin from "@/pages/DocumentariesAdmin";
import WitnessVideosAdmin from "@/pages/WitnessVideosAdmin";
import PublicArticles from "@/pages/PublicArticles";
import PublicArticlesAdmin from "@/pages/PublicArticlesAdmin";
import MissingPersons from "@/pages/MissingPersons";
import MissingPersonsAdmin from "@/pages/MissingPersonsAdmin";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }
  if (!isAuthenticated) return <AdminLogin />;
  return <>{children}</>;
}

function AdminRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <AdminGuard>
      <Component />
    </AdminGuard>
  );
}

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
      <Route path="/store/policies" component={StorePolicies} />
      <Route path="/store/:slug" component={ProductDetail} />
      <Route path="/membership" component={Membership} />
      <Route path="/donate" component={Donate} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-tracking" component={OrderTracking} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/songs" component={Songs} />
      <Route path="/membership-tiers" component={MembershipTiers} />
      <Route path="/events" component={VirtualEvents} />
      <Route path="/events/:slug" component={VirtualEventDetail} />
      <Route path="/campaigns" component={CampaignsList} />
      <Route path="/campaigns/:slug" component={CampaignDetail} />
      <Route path="/fundraise" component={Fundraise} />
      <Route path="/fundraise/:slug" component={FundraiserPage} />
      <Route path="/auctions" component={Auctions} />
      <Route path="/auctions/:slug" component={AuctionDetail} />
      <Route path="/about" component={AboutUs} />
      <Route path="/fallen-heroes" component={FallenHeroes} />
      <Route path="/documentaries" component={Documentaries} />
      <Route path="/articles" component={PublicArticles} />
      <Route path="/missing-persons" component={MissingPersons} />
      <Route path="/portal/chapter/:slug" component={ChapterPortal} />
      <Route path="/portal/region/:slug" component={RegionPortal} />
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/printful">{() => <AdminRoute component={PrintfulAdmin} />}</Route>
      <Route path="/admin/songs">{() => <AdminRoute component={SongsAdmin} />}</Route>
      <Route path="/admin/events">{() => <AdminRoute component={EventsAdmin} />}</Route>
      <Route path="/admin/membership">{() => <AdminRoute component={MembershipAdmin} />}</Route>
      <Route path="/admin/chapters">{() => <AdminRoute component={ChaptersAdmin} />}</Route>
      <Route path="/admin/store">{() => <AdminRoute component={StoreAdmin} />}</Route>
      <Route path="/admin/regions">{() => <AdminRoute component={RegionAdmin} />}</Route>
      <Route path="/admin/regions/:slug">{() => <AdminRoute component={RegionDetailAdmin} />}</Route>
      <Route path="/admin/members">{() => <AdminRoute component={MembersAdmin} />}</Route>
      <Route path="/admin/conferences">{() => <AdminRoute component={ConferencesAdmin} />}</Route>
      <Route path="/admin/campaigns">{() => <AdminRoute component={CampaignsAdmin} />}</Route>
      <Route path="/admin/blog">{() => <AdminRoute component={BlogAdmin} />}</Route>
      <Route path="/admin/donations">{() => <AdminRoute component={DonationsAdmin} />}</Route>
      <Route path="/admin/auctions">{() => <AdminRoute component={AuctionsAdmin} />}</Route>
      <Route path="/admin/tiers">{() => <AdminRoute component={MembershipTiersAdmin} />}</Route>
      <Route path="/admin/orders">{() => <AdminRoute component={OrdersAdmin} />}</Route>
      <Route path="/admin/gallery">{() => <AdminRoute component={GalleryAdmin} />}</Route>
      <Route path="/admin/newsletter">{() => <AdminRoute component={NewsletterAdmin} />}</Route>
      <Route path="/admin/fundraisers">{() => <AdminRoute component={FundraisersAdmin} />}</Route>
      <Route path="/admin/news">{() => <AdminRoute component={NewsAdmin} />}</Route>
      <Route path="/admin/fallen-heroes">{() => <AdminRoute component={FallenHeroesAdmin} />}</Route>
      <Route path="/admin/missing-persons">{() => <AdminRoute component={MissingPersonsAdmin} />}</Route>
      <Route path="/admin/human-rights-reports">{() => <AdminRoute component={HumanRightsReportsAdmin} />}</Route>
      <Route path="/admin/community-events">{() => <AdminRoute component={CommunityEventsAdmin} />}</Route>
      <Route path="/admin/documentaries">{() => <AdminRoute component={DocumentariesAdmin} />}</Route>
      <Route path="/admin/witness-videos">{() => <AdminRoute component={WitnessVideosAdmin} />}</Route>
      <Route path="/admin/public-articles">{() => <AdminRoute component={PublicArticlesAdmin} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AnimatedMain() {
  const [location] = useLocation();
  return (
    <main key={location} className="flex-1 pb-20 lg:pb-0 app-page-enter">
      <Router />
    </main>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminAuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <AnimatedMain />
              <div className="hidden lg:block">
                <Footer />
              </div>
              <MobileNav />
              <InstallPrompt />
            </div>
            <Toaster />
          </AdminAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
