import { Badge } from "@/components/reui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serverTrpc } from "@/trpc/server";

interface ResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;

  const results = await serverTrpc.test.getResults({
    testId: id,
  });

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>

          <p className="text-muted-foreground text-sm">
            Student performance for test {id}.
          </p>
        </div>
      </header>

      <main>
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>

                <TableHead>Student</TableHead>

                <TableHead>Accuracy</TableHead>

                <TableHead className="text-right">Score</TableHead>

                <TableHead className="text-right">Time Completed</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {results.map((item, index) => {
                const name = item.studentName || "Unknown Student";

                const initials = name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <TableRow key={`${item.studentId}-${item.testId}`}>
                    <TableCell className="text-center text-sm font-bold">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={item.studentImage || undefined}
                            alt={name}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{name}</span>

                          <span className="text-muted-foreground text-xs">
                            {item.studentEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="default" size="sm">
                        {item.accuracy}%
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm font-medium">
                      {item.score}
                    </TableCell>

                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.timeCompleted
                        ? new Date(item.timeCompleted).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {results.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No students have completed this test yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
