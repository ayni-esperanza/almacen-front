import { useState, useCallback } from "react";
import { PurchaseOrder } from "../types/purchases.ts";
import {
  purchaseOrdersService,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from "../services/purchase-orders.service.ts";

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Pasar parámetros cuando backend esté listo
      // const result = await purchaseOrdersService.getAllPurchaseOrders(
      //   startDate,
      //   endDate,
      //   currentPage,
      //   itemsPerPage,
      //   searchTerm
      // );
      const result = await purchaseOrdersService.getAllPurchaseOrders();
      setPurchaseOrders(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar órdenes de compra");
      console.error("Error fetching purchase orders:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, currentPage, itemsPerPage, searchTerm]);

  const createPurchaseOrder = async (data: CreatePurchaseOrderData) => {
    try {
      setLoading(true);
      const newOrder = await purchaseOrdersService.createPurchaseOrder(data);
      await fetchPurchaseOrders();
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear orden de compra");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (id: number, data: UpdatePurchaseOrderData) => {
    try {
      setLoading(true);
      await purchaseOrdersService.updatePurchaseOrder(id, data);
      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar orden de compra");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchaseOrder = async (id: number) => {
    try {
      setLoading(true);
      await purchaseOrdersService.deletePurchaseOrder(id);
      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar orden de compra");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseOrders,
    loading,
    error,
    startDate,
    endDate,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    setStartDate,
    setEndDate,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    refetch: fetchPurchaseOrders,
  };
};
