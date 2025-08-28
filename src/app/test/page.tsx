import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inventry Setup Test
          </h1>
          <p className="text-lg text-gray-600">
            This page tests if all the basic components are working correctly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Component</CardTitle>
              <CardDescription>
                Testing the shadcn/ui Button component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS</CardTitle>
              <CardDescription>
                Testing Tailwind CSS classes and custom variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-primary rounded"></div>
                <div className="h-4 bg-secondary rounded"></div>
                <div className="h-4 bg-accent rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>
                Testing TypeScript compilation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you can see this page, TypeScript is working correctly!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next.js 14</CardTitle>
              <CardDescription>
                Testing Next.js App Router
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page is using the new App Router structure.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Status</CardTitle>
            <CardDescription>
              Current project configuration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Next.js 14 + TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Tailwind CSS + shadcn/ui</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Supabase configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Database schema ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
