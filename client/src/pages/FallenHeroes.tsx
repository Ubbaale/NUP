import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { format, differenceInYears, parseISO } from "date-fns";
import type { FallenHero } from "@shared/schema";
import { Flame } from "lucide-react";

function calculateAge(dob: string, dod: string): number | null {
  try {
    return differenceInYears(parseISO(dod), parseISO(dob));
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export default function FallenHeroes() {
  const { data: heroes, isLoading } = useQuery<FallenHero[]>({
    queryKey: ["/api/fallen-heroes"],
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="In Eternal Memory — Our Fallen Heroes | NUP Diaspora"
        description="Honoring the brave men and women who gave their lives in the struggle for freedom, democracy, and justice in Uganda. Their sacrifice will never be forgotten."
        keywords="NUP fallen heroes, Uganda martyrs, People Power heroes, NUP memorial, Uganda freedom fighters"
      />

      <section className="relative py-28 md:py-36 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.3) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Flame className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4" data-testid="text-fallen-heroes-heading">
            In Eternal Memory
          </h1>
          <p className="text-xl md:text-2xl text-red-300 font-semibold mb-4">Our Fallen Heroes</p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            We honor the brave men and women who made the ultimate sacrifice in the struggle for freedom, 
            democracy, and justice in Uganda. Their courage lives on in every step we take toward liberation.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gradient-to-b from-black to-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground italic text-lg max-w-2xl mx-auto">
              "The heroes of yesterday are the foundation of tomorrow. We shall never forget their sacrifice."
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : heroes && heroes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {heroes.map(hero => {
                const age = hero.dateOfBirth && hero.dateOfDeath ? calculateAge(hero.dateOfBirth, hero.dateOfDeath) : null;
                return (
                  <Card key={hero.id} className="overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur" data-testid={`card-fallen-hero-${hero.id}`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {hero.photoUrl ? (
                          <div className="sm:w-48 h-56 sm:h-auto shrink-0">
                            <img
                              src={hero.photoUrl}
                              alt={hero.fullName}
                              className="w-full h-full object-cover"
                              data-testid={`img-fallen-hero-${hero.id}`}
                            />
                          </div>
                        ) : (
                          <div className="sm:w-48 h-56 sm:h-auto shrink-0 bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center">
                            <Flame className="w-16 h-16 text-red-500/50" />
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          <h3 className="text-xl font-bold mb-1" data-testid={`text-hero-name-${hero.id}`}>
                            {hero.fullName}
                          </h3>
                          {age !== null && (
                            <p className="text-sm text-muted-foreground mb-2">Age {age}</p>
                          )}

                          <div className="space-y-1 mb-3">
                            {hero.dateOfBirth && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Born:</span>{" "}
                                <span className="font-medium">{formatDate(hero.dateOfBirth)}</span>
                              </p>
                            )}
                            {hero.dateOfDeath && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Died:</span>{" "}
                                <span className="font-medium text-red-500">{formatDate(hero.dateOfDeath)}</span>
                              </p>
                            )}
                            {hero.location && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">From:</span>{" "}
                                <span className="font-medium">{hero.location}</span>
                              </p>
                            )}
                          </div>

                          {hero.biography && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                              {hero.biography}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Flame className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Memorial Under Construction</h3>
              <p className="text-muted-foreground">The fallen heroes memorial is being prepared. Check back soon.</p>
            </div>
          )}

          {heroes && heroes.length > 0 && (
            <div className="mt-16 text-center">
              <div className="w-24 h-px bg-red-500/50 mx-auto mb-6" />
              <p className="text-red-400 font-semibold text-lg mb-2">Rest In Power</p>
              <p className="text-muted-foreground">
                Their sacrifice fuels our determination. The struggle continues until Uganda is free.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
