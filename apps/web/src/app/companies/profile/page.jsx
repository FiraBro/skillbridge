import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaBuilding, FaGlobe, FaInfoCircle, FaSave } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
    website: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/companies/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch company profile:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/companies/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Profile Updated",
          description: "Your company details have been saved.",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Company Branding</h1>
        <p className="text-muted-foreground">
          Set up your company profile to build trust with developers.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FaBuilding className="text-primary" /> Company Name
              </label>
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="e.g. Acme Tech"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FaGlobe className="text-primary" /> Website
              </label>
              <Input
                value={profile.website}
                onChange={(e) =>
                  setProfile({ ...profile, website: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaInfoCircle className="text-primary" /> About the Company
            </label>
            <Textarea
              value={profile.description}
              onChange={(e) =>
                setProfile({ ...profile, description: e.target.value })
              }
              placeholder="Tell developers about your mission and culture..."
              className="h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Input
                value={profile.industry}
                onChange={(e) =>
                  setProfile({ ...profile, industry: e.target.value })
                }
                placeholder="e.g. Fintech, AI, E-commerce"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Size</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={profile.size}
                onChange={(e) =>
                  setProfile({ ...profile, size: e.target.value })
                }
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="500+">500+ Employees</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <FaSave /> {loading ? "Saving..." : "Save Branding"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
