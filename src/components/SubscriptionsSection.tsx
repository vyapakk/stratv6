import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { ChevronRight, Package, Lock, Layers, Plane, Car, Building2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const iconMap: Record<string, any> = {
  Layers,
  Plane,
  Car,
  Building2,
  MoreHorizontal,
};

const iconBgStyles: Record<string, string> = {
  teal: "bg-primary text-primary-foreground",
  navy: "bg-secondary text-secondary-foreground",
  mint: "gradient-accent text-accent-foreground",
  "teal-dark": "bg-teal-dark text-primary-foreground",
};

const SubscriptionsSection = () => {
  const navigate = useNavigate();
  const { subCategories } = useAppSelector(state => state.categories);

  // Filter subcategories that have at least one purchased dashboard
  const subscribedDatasets = subCategories.filter((sub) => sub.purchased);
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Your Subscriptions
        </h2>
        <p className="text-sm text-muted-foreground">
          Quick access to your purchased datasets
        </p>
      </div>

      {subscribedDatasets.length === 0 ? (
        <Alert className="bg-muted/50 border-muted">
          <Package className="h-4 w-4" />
          <AlertDescription>
            You haven't subscribed to any dataset yet. Check out all datasets below to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subscribedDatasets.map((dataset, index) => {
            // Use the dynamically provided icon from the backend or fallback to MoreHorizontal
            const Icon = dataset.category_icon && iconMap[dataset.category_icon]
              ? iconMap[dataset.category_icon]
              : MoreHorizontal;

            const colorKey = dataset.category_color || "teal";
            const bgClass = iconBgStyles[colorKey] || iconBgStyles.teal;

            return (
              <Card
                key={dataset.id}
                onClick={() => navigate(`/dataset/${dataset.slug}`)}
                className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 animate-fade-in-up border-primary/20 bg-primary/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${bgClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                        {dataset.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {dataset.category_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {dataset.purchased_count} of {dataset.total_dashboards} unlocked
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SubscriptionsSection;
