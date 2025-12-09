import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFacultyAnalytics } from "@/hooks/useFacultyAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#a855f7", "#f59e0b", "#06b6d4"]; // green, red, blue, purple, amber, cyan

const FacultyAnalytics = () => {
  const { stats, loading } = useFacultyAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded w-16 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalReviewed = stats.myReviewedLeaves || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reviewed by me</CardTitle>
            <CardDescription>Total decisions made</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myReviewedLeaves}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-600">Approved</CardTitle>
            <CardDescription>My approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.myApprovedLeaves}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Rejected</CardTitle>
            <CardDescription>My rejections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.myRejectedLeaves}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending queue</CardTitle>
            <CardDescription>Awaiting review (all)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPendingLeaves}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Insights from your review activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trend">
            <TabsList>
              <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
              <TabsTrigger value="status">Status Breakdown</TabsTrigger>
              <TabsTrigger value="types">Types</TabsTrigger>
            </TabsList>

            <TabsContent value="trend" className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyReviewedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="status" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={stats.statusData} cx="50%" cy="50%" outerRadius={90} label>
                        {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats.statusData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{s.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{s.value} ({s.percentage}%)</div>
                    </div>
                  ))}
                  {totalReviewed === 0 && (
                    <div className="text-sm text-muted-foreground">No reviewed leaves yet.</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="types" className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyAnalytics;
