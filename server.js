// ==========================================
// ENTERPRISE BACKEND ARCHITECTURE (Node.js/Express)
// ==========================================

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. DATA LAYER (Mock Database Connection Pool & Access Object)
const dbPool = {
    data: [
        { id: "AST-1001", partName: "Heavy Duty Hydraulic Pump", serialNumber: "HP-9921", status: "Operational", lastMaintained: "2026-03-12" },
        { id: "AST-1002", partName: "Conveyor Main Drive Motor", serialNumber: "CBM-4410", status: "Maintenance Required", lastMaintained: "2025-11-05" }
    ]
};

class InventoryModel {
    static async getAll() {
        return new Promise((resolve) => setTimeout(() => resolve(dbPool.data), 50));
    }

    static async create(itemData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!itemData.partName || !itemData.serialNumber) {
                    return reject(new Error("Validation Failed: Missing required fields."));
                }
                const newAsset = {
                    id: `AST-${Date.now().toString().slice(-4)}`,
                    partName: itemData.partName,
                    serialNumber: itemData.serialNumber,
                    status: itemData.status || "Operational",
                    lastMaintained: new Date().toISOString().split('T')[0]
                };
                dbPool.data.push(newAsset);
                resolve(newAsset);
            }, 50);
        });
    }
}

// 2. CONTROLLER LAYER (Application Business Logic)
const inventoryController = {
    getInventoryList: async (req, res, next) => {
        try {
            const items = await InventoryModel.getAll();
            res.status(200).json({ success: true, count: items.length, data: items });
        } catch (error) {
            next(error);
        }
    },
    addInventoryItem: async (req, res, next) => {
        try {
            const newItem = await InventoryModel.create(req.body);
            res.status(201).json({ success: true, data: newItem });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
};

// 3. MIDDLEWARE & ROUTING INTERFACE LAYER
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/v1/inventory', inventoryController.getInventoryList);
app.post('/api/v1/inventory', inventoryController.addInventoryItem);

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[SYSTEM ERROR]: ${err.stack}`);
    res.status(500).json({ success: false, error: 'Internal Infrastructure System Error' });
});

// 4. BOOTSTRAPPER RUN-TIME
app.listen(PORT, () => {
    console.log(`[SYSTEM] Enterprise Resource API initiated on port ${PORT}`);
});