# AmeenCAD replacement for qcad/src/3rdparty/spatialindexnavel/spatialindexnavel.pro (QCAD v3.33.1.0).
# Upstream's qmake file only compiles the R-tree sources while declaring every class
# exportable, which fails to link on MSVC. This mirrors upstream's CMakeLists.txt
# (all sources, SIDX_DLL_EXPORT). See docs/build-report.md.
include( ../../../shared.pri )

TARGET = spatialindexnavel
TEMPLATE = lib
r_static_libs {
    CONFIG += staticlib
}
else {
    CONFIG += plugin
}
# several sources share a file name (Index.cc, Node.cc, ...) in different folders:
CONFIG += object_parallel_to_source

DEFINES += NDEBUG
DEFINES += SPATIALINDEX_CREATE_DLL
DEFINES += SIDX_DLL_EXPORT

!win32-msvc2010 {
    DEFINES += HAVE_BZERO
}
!win32 {
    DEFINES += PTHREADS
    DEFINES += HAVE_PTHREAD_H
    DEFINES += HAVE_SRAND48
}

CONFIG -= warn_on
CONFIG += warn_off

INCLUDEPATH += include

HEADERS = $$files(src/rtree/*.h) $$files(src/mvrtree/*.h) $$files(src/tprtree/*.h) $$files(src/storagemanager/*.h)

SOURCES = \
    $$files(src/rtree/*.cc) \
    $$files(src/mvrtree/*.cc) \
    $$files(src/tprtree/*.cc) \
    $$files(src/spatialindex/*.cc) \
    $$files(src/storagemanager/*.cc) \
    $$files(src/capi/*.cc) \
    src/tools/rand48.cc \
    src/tools/Tools.cc
