import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, Layers, Plane, Car, Building2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SubCategory } from "@/store/slices/categorySlice";

interface DatasetListProps {
  subCategories: SubCategory[];
  isLoading: boolean;
}

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

const DatasetList = ({ subCategories, isLoading }: DatasetListProps) => {
  const navigate = useNavigate();

  console.log(subCategories);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((skeleton) => (
          <div key={skeleton} className="h-[90px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (subCategories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
        No datasets found for this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {subCategories.map((dataset, index) => {
        // Use the dynamically provided icon from the backend or fallback to MoreHorizontal
        const Icon = dataset.category_icon && iconMap[dataset.category_icon]
          ? iconMap[dataset.category_icon]
          : MoreHorizontal;

        const isLocked = !dataset.purchased;
        const colorKey = dataset.category_color || "teal";
        const bgClass = iconBgStyles[colorKey] || iconBgStyles.teal;

        return (
          <Card
            key={dataset.id}
            onClick={() => navigate(`/dataset/${dataset.slug}`)}
            className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 animate-fade-in-up"
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
                      {dataset.total_dashboards} dashboards
                    </span>
                  </div>
                </div>
                {isLocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DatasetList;
