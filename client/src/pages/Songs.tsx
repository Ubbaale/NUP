import RevolutionarySongs from "@/components/RevolutionarySongs";
import { SEO } from "@/components/SEO";

export default function Songs() {
  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Revolutionary Songs"
        description="Listen to revolutionary songs from the People Power movement and National Unity Platform. Music that inspires the fight for democracy and freedom in Uganda."
        keywords="NUP songs, People Power music, Uganda revolutionary songs, Bobi Wine music, Uganda freedom songs, NUP anthem, People Power anthem, Uganda protest songs"
      />
      <div className="container mx-auto px-4">
        <RevolutionarySongs />
      </div>
    </div>
  );
}
