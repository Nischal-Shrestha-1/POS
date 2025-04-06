import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { database } from "../config/firebaseConfig";
import { ref, onValue } from "firebase/database";

const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const productsRef = ref(database, "products");
    const salesRef = ref(database, "sales");
    const purchasesRef = ref(database, "purchases");

    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setProducts(parsed);
      }
    });

    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setSales(parsed);
      }
    });

    onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setPurchases(parsed);
      }
    });
  }, []);

  const salesByProduct = {};
  sales.forEach((sale) => {
    const productName = products.find(
      (p) => p.id === sale.product
    )?.productName;
    const quantity = parseInt(sale.quantity);
    if (productName && !isNaN(quantity)) {
      salesByProduct[productName] =
        (salesByProduct[productName] || 0) + quantity;
    }
  });

  const pieChartData = Object.entries(salesByProduct).map(
    ([name, quantity], i) => ({
      name,
      quantity,
      color: ["#ff6384", "#36a2eb", "#ffce56", "#4caf50", "#9c27b0", "#f57c00"][
        i % 6
      ],
      legendFontColor: "#333",
      legendFontSize: 14,
    })
  );

  const purchaseByDate = {};
  purchases.forEach((purchase) => {
    const date = purchase.datePurchased;
    const quantity = parseInt(purchase.quantity);
    if (date && !isNaN(quantity)) {
      purchaseByDate[date] = (purchaseByDate[date] || 0) + quantity;
    }
  });

  const barChartLabels = Object.keys(purchaseByDate);
  const barChartValues = Object.values(purchaseByDate);

  const salesByDate = {};
  sales.forEach((sale) => {
    const date = sale.soldDate;
    const quantity = parseInt(sale.quantity);
    if (date && !isNaN(quantity)) {
      salesByDate[date] = (salesByDate[date] || 0) + quantity;
    }
  });

  const lineChartLabels = Object.keys(salesByDate);
  const lineChartValues = Object.values(salesByDate);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Dashboard</Text>

      <Text style={styles.chartTitle}>🥧 Sales by Product</Text>
      {pieChartData.length > 0 ? (
        <PieChart
          data={pieChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="quantity"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No sales data available</Text>
      )}

      <Text style={styles.chartTitle}>📦 Purchases Per Day</Text>
      {barChartLabels.length > 0 ? (
        <BarChart
          data={{
            labels: barChartLabels,
            datasets: [{ data: barChartValues }],
          }}
          width={screenWidth - 40}
          height={260}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
        />
      ) : (
        <Text style={styles.noData}>No purchase data available</Text>
      )}

      <Text style={styles.chartTitle}>📈 Sales Per Day</Text>
      {lineChartLabels.length > 0 ? (
        <LineChart
          data={{
            labels: lineChartLabels,
            datasets: [{ data: lineChartValues }],
          }}
          width={screenWidth - 40}
          height={260}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No sales data available</Text>
      )}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#2196f3",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  chart: {
    marginBottom: 30,
    borderRadius: 10,
  },
  noData: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#888",
    marginBottom: 30,
  },
});

export default DashboardScreen;
