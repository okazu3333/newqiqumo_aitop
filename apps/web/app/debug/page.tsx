"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";

export default function DebugPage() {
  const { data, isLoading } = trpc.debug.info.useQuery();
  const [query, setQuery] = useState("SELECT * FROM Survey");
  const executeQuery = trpc.debug.executeQuery.useMutation();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading debug information...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            Failed to load debug information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="query">SQL Query</TabsTrigger>
          <TabsTrigger value="api">API Routes</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provider: {data.database.provider}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.database.models.map((model) => (
                  <div key={model.name} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">{model.name}</h3>
                    <div className="space-y-2">
                      {model.fields.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">
                              {field.name}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.optional && (
                              <Badge variant="secondary" className="text-xs">
                                optional
                              </Badge>
                            )}
                          </div>
                          {field.attributes && (
                            <code className="text-xs text-muted-foreground">
                              {field.attributes}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Executor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Execute read-only queries against the SQLite database
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="sql-query" className="text-sm font-medium">
                  SQL Query
                </label>
                <Textarea
                  id="sql-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="font-mono min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Only SELECT, PRAGMA, and EXPLAIN queries are allowed
                </p>
              </div>

              <Button
                onClick={() => executeQuery.mutate({ query })}
                disabled={executeQuery.isPending || !query.trim()}
              >
                {executeQuery.isPending ? "Executing..." : "Execute Query"}
              </Button>

              {executeQuery.data && (
                <div className="space-y-4">
                  {executeQuery.data.success ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Results</h4>
                        <Badge variant="outline">
                          {executeQuery.data.rowCount} rows
                        </Badge>
                      </div>
                      {executeQuery.data.result &&
                      Array.isArray(executeQuery.data.result) &&
                      executeQuery.data.result.length > 0 ? (
                        <ScrollArea className="h-[400px] w-full rounded border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(executeQuery.data.result[0]).map(
                                  (key) => (
                                    <TableHead key={key} className="font-mono">
                                      {key}
                                    </TableHead>
                                  ),
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {executeQuery.data.result.map(
                                (row: any, idx: number) => (
                                  <TableRow key={idx}>
                                    {Object.values(row).map(
                                      (value, cellIdx) => (
                                        <TableCell
                                          key={cellIdx}
                                          className="font-mono text-sm"
                                        >
                                          {value === null
                                            ? "NULL"
                                            : String(value)}
                                        </TableCell>
                                      ),
                                    )}
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No results returned
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="rounded border border-destructive/50 bg-destructive/10 p-4">
                      <p className="text-sm font-semibold text-destructive">
                        Error
                      </p>
                      <p className="text-sm text-destructive/80">
                        {"error" in executeQuery.data
                          ? executeQuery.data.error
                          : "Unknown error"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Routes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Base URL: {data.api.baseUrl}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {data.api.routes.map((route, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold">
                          {route.path}
                        </code>
                        <Badge
                          variant={
                            route.method === "query" ? "default" : "secondary"
                          }
                        >
                          {route.method}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {route.description}
                      </p>
                      {"input" in route && route.input && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold mb-1">Input:</p>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(route.input, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="font-mono text-sm">NODE_ENV</span>
                  <Badge variant="outline">
                    {data.environment.nodeEnv || "development"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-mono text-sm">API_PORT</span>
                  <Badge variant="outline">{data.environment.apiPort}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
