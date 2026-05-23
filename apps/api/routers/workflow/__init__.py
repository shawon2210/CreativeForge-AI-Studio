"""
Workflow router - aggregates all workflow sub-routers.
"""
from fastapi import APIRouter

from routers.workflow.execute import router as execute_router
from routers.workflow.save import router as save_router
from routers.workflow.validate import router as validate_router
from routers.workflow.nodes import router as nodes_router

router = APIRouter(prefix="/api/workflow", tags=["Workflow"])

router.include_router(execute_router)
router.include_router(save_router)
router.include_router(validate_router)
router.include_router(nodes_router)
