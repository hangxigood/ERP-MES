'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50
  });
  const [filters, setFilters] = useState({
    collection: '',
    operation: '',
    startDate: format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'),
    endDate: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
    userId: '',
    userRole: '',
    page: 1
  });

  const [filterOptions, setFilterOptions] = useState({
    users: [],
    roles: [],
    collections: []
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      );
      queryParams.append('limit', pagination.limit);
      
      const response = await fetch(`/api/audit-logs?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        setPagination(prev => ({
          ...prev,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.pages,
          total: data.pagination.total
        }));
        setFilterOptions({
          users: data.filters?.users || [],
          roles: data.filters?.roles || [],
          collections: data.filters?.collections || []
        });
      } else {
        console.error('Error fetching logs:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const renderUserInfo = (metadata) => {
    if (!metadata?.user) return 'N/A';
    const { user } = metadata;
    return (
      <div className="space-y-1">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
        <Badge variant="outline">{user.role}</Badge>
        {metadata.clientInfo && (
          <div className="text-xs text-muted-foreground mt-1">
            IP: {metadata.clientInfo.ip}
          </div>
        )}
      </div>
    );
  };

  const renderChanges = (log) => {
    if (log.operationType === 'insert') {
      return <Badge variant="success">New document created</Badge>;
    }

    if (log.operationType === 'delete') {
      return <Badge variant="destructive">Document deleted</Badge>;
    }

    if (log.updateDescription?.fields) {
      return (
        <div className="space-y-2">
          {log.updateDescription.fields.map((change, index) => (
            <div key={index} className="border-l-4 border-primary pl-2 py-1">
              <div className="text-sm">
                <span className="text-muted-foreground pr-2">Section:</span>
                <span className="font-medium">{change.sectionName}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground pr-2">Row:</span>
                <span className="font-medium">{change.label}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground pr-2">Column:</span>
                <span className="font-medium">{change.fieldName}:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-destructive">
                    Old: {change.old || '(empty)'}
                  </div>
                  <div className="text-success">
                    New: {change.new || '(empty)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-muted-foreground">No changes recorded</span>;
  };

  if (!session || (session.user.role !== 'ADMIN')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Access Denied: You are not authorized to access this page
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.collection}
              onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_COLLECTIONS">All Collections</SelectItem>
                {filterOptions.collections.map((collection) => (
                  <SelectItem key={collection} value={collection || 'UNKNOWN_COLLECTION'}>
                    {collection || 'Unknown Collection'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.userRole}
              onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_ROLES">All Roles</SelectItem>
                {filterOptions.roles.map((role) => (
                  <SelectItem key={role} value={role || 'UNKNOWN_ROLE'}>
                    {role || 'Unknown Role'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.userId}
              onValueChange={(value) => {
                if (value === 'ALL_USERS') {
                  setFilters(prev => ({ ...prev, userId: '', page: 1 }));
                } else {
                  setFilters(prev => ({ ...prev, userId: value, page: 1 }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_USERS">All Users</SelectItem>
                {filterOptions.users.map((user) => (
                  <SelectItem 
                    key={user.id || 'unknown'} 
                    value={user.id || 'UNKNOWN_USER'}
                  >
                    {user.name || 'Unknown User'} ({user.email || 'no email'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-4">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="flex-1"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>User Info</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.operationType === 'insert'
                            ? 'success'
                            : log.operationType === 'delete'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {log.operationType}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.collectionName}</TableCell>
                    <TableCell className="font-mono">{log.documentId}</TableCell>
                    <TableCell>{renderUserInfo(log.metadata)}</TableCell>
                    <TableCell>{renderChanges(log)}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Pagination Controls */}
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {logs.length} of {pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
