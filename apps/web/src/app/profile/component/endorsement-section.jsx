// apps/web/src/app/profile/component/endorsement-section.jsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaStar, FaPlus } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export default function EndorsementSection({ endorsements, onEndorse }) {
  console.log("EndorsementSection - endorsements:", endorsements);
  if (!endorsements || endorsements.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <div className="text-center space-y-3">
          <div className="p-3 rounded-full bg-yellow-500/10 w-fit mx-auto">
            <FaStar className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">No endorsements yet</h4>
            <p className="text-xs text-muted-foreground">
              Be the first to endorse this developer's skills
            </p>
          </div>
          {onEndorse && (
            <Button size="sm" onClick={onEndorse} className="gap-2">
              <FaPlus className="w-3 h-3" />
              Endorse Skills
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Group endorsements by skill
  const groupedEndorsements = endorsements.reduce((acc, endorsement) => {
    const skillName = endorsement.skill_name || "General";
    if (!acc[skillName]) {
      acc[skillName] = [];
    }
    acc[skillName].push(endorsement);
    return acc;
  }, {});

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Endorsements
          <Badge variant="secondary">{endorsements.length}</Badge>
        </h3>
        {onEndorse && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEndorse}
            className="gap-2"
          >
            <FaPlus className="w-3 h-3" />
            Endorse
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(groupedEndorsements).map(
          ([skillName, skillEndorsements]) => (
            <div key={skillName} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
                  {skillName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {skillEndorsements.length} endorsement
                  {skillEndorsements.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2 pl-4">
                {skillEndorsements.map((endorsement) => (
                  <div
                    key={endorsement.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={endorsement.endorser_avatar} />
                      <AvatarFallback>
                        {endorsement.endorser_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {endorsement.endorser_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(endorsement.created_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>

                      {endorsement.message && (
                        <p className="text-sm text-muted-foreground">
                          "{endorsement.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
