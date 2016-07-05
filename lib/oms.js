'use strict';

window.initilizeOverlappingMarkerSpiderfier = function () {
  var ref,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  if (((ref = this.google) !== null ? ref.maps : void 0) === null) {
    return;
  }

  window.OverlappingMarkerSpiderfier = (function() {
    var ge, gm, j, lcH, lcU, mt, p, ref1, twoPi, x;

    var _Class = function(map1, opts) {
      var i, ref2;
      this.map = map1;
      if (opts === null) {
        opts = {};
      }
      for (i in opts) {
        if (!hasProp.call(opts, i)) {
          continue;
        }
        this[i] = opts[i];
      }
      this.projHelper = new this.constructor.ProjHelper(this.map);
      this.initMarkerArrays();
      this.listeners = {};
      ref2 = ['click', 'zoom_changed', 'maptypeid_changed'];
      for (i = ref2.length - 1; i >= 0; i--) {
        ge.addListener(this.map, ref2[i], (function(_this) {
          return function() {
            return _this.unspiderfy();
          };
        })(this));
      }
    };

    p = _Class.prototype;

    ref1 = [_Class, p];
    for (j = ref1.length - 1; j >= 0; j--) {
      x = ref1[j];
      x.VERSION = '0.3.3';
    }

    gm = google.maps;
    ge = gm.event;
    mt = gm.MapTypeId;

    twoPi = Math.PI * 2;

    p.keepSpiderfied = false;
    p.nearbyDistance = 20;
    p.circleSpiralSwitchover = 9;
    p.circleFootSeparation = 23;
    p.circleStartAngle = twoPi / 12;
    p.spiralFootSeparation = 26;
    p.spiralLengthStart = 11;
    p.spiralLengthFactor = 4;
    p.spiderfiedZIndex = 1000;
    p.usualLegZIndex = 10;
    p.highlightedLegZIndex = 20;
    p.legWeight = 1.5;
    p.legColors = {
      'usual': {},
      'highlighted': {}
    };

    lcU = p.legColors.usual;
    lcH = p.legColors.highlighted;

    lcU[mt.HYBRID] = lcU[mt.SATELLITE] = '#fff';
    lcH[mt.HYBRID] = lcH[mt.SATELLITE] = '#f00';
    lcU[mt.TERRAIN] = lcU[mt.ROADMAP] = '#444';
    lcH[mt.TERRAIN] = lcH[mt.ROADMAP] = '#f00';

    p.initMarkerArrays = function() {
      this.markers = [];
      this.markerListenerRefs = [];
      return this.markerListenerRefs;
    };

    p.addMarker = function(marker) {
      // if (marker._oms) {
      //   return this;
      // }
      // marker._oms = true;
      var listenerRefs = [
        ge.addListener(marker, 'click', (function(_this) {
          return function(event) {
            return _this.spiderListener(marker, event);
          };
        })(this))
      ];
      this.markerListenerRefs.push(listenerRefs);
      this.markers.push(marker);
      return this;
    };

    p.getMarkers = function() {
      return this.markers.slice(0);
    };

    // p['removeMarker'] = function(marker) {
    //   var i, l, len1, listenerRef, listenerRefs;
    //   if (marker['_omsData'] !== null) {
    //     this['unspiderfy']();
    //   }
    //   i = this.arrIndexOf(this.markers, marker);
    //   if (i < 0) {
    //     return this;
    //   }
    //   listenerRefs = this.markerListenerRefs.splice(i, 1)[0];
    //   for (l = 0, len1 = listenerRefs.length; l < len1; l++) {
    //     listenerRef = listenerRefs[l];
    //     ge.removeListener(listenerRef);
    //   }
    //   delete marker['_oms'];
    //   this.markers.splice(i, 1);
    //   return this;
    // };

    p.clearMarkers = function() {
      var i, j, listenerRefs, marker, ref2;
      this.unspiderfy();
      ref2 = this.markers;
      for (i = ref2.length - 1; i >= 0; i--) {
        marker = ref2[i];
        listenerRefs = this.markerListenerRefs[i];
        for (j = listenerRefs.length - 1; j >= 0; j--) {
          ge.removeListener(listenerRefs[j]);
        }
        delete marker._oms;
      }
      this.initMarkerArrays();
      return this;
    };

    p.addListener = function(event, func) {
      var base;
      if(this.listeners){
        base = this.listeners;
      }
      base[event] = base[event] || [];
      base[event].push(func);
      return this;
    };

    p.removeListener = function(event, func) {
      var i = this.arrIndexOf(this.listeners[event], func);
      if (i >= 0) {
        this.listeners[event].splice(i, 1);
      }
      return this;
    };

    p.clearListeners = function(event) {
      this.listeners[event] = [];
      return this;
    };

    p.trigger = function() {
      var args, event, l, ref2, results;
      event = arguments[0];
      args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ref2 = this.listeners[event] || [];
      results = [];
      for (l = ref2.length - 1; l >= 0; l--) {
        results.push(ref2[l].apply(null, args));
      }
      return results;
    };

    p.generatePtsCircle = function(count, centerPt) {
      var angle, angleStep, circumference, i, l, legLength, ref2, results;
      circumference = this.circleFootSeparation * (2 + count);
      legLength = circumference / twoPi;
      angleStep = twoPi / count;
      results = [];
      for (i = l = 0, ref2 = count; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        angle = this.circleStartAngle + i * angleStep;
        results.push(new gm.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle)));
      }
      return results;
    };

    p.generatePtsSpiral = function(count, centerPt) {
      var angle, i, l, legLength, pt, ref2, results;
      legLength = this.spiralLengthStart;
      angle = 0;
      results = [];
      for (i = l = 0, ref2 = count; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        angle += this.spiralFootSeparation / legLength + i * 0.0005;
        pt = new gm.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle));
        legLength += twoPi * this.spiralLengthFactor / angle;
        results.push(pt);
      }
      return results;
    };

    p.spiderListener = function(marker, event) {
      var l, m, mPt, markerPt, markerSpiderfied, nDist, nearbyMarkerData, nonNearbyMarkers, pxSq, ref2;
      markerSpiderfied = marker._omsData !== 'undefined';
      markerSpiderfied = typeof marker._omsData !== 'undefined';
      if (!(markerSpiderfied && this.keepSpiderfied)) {
        this.unspiderfy();
      }

      if (markerSpiderfied || this.map.getStreetView().getVisible() || this.map.getMapTypeId() === 'GoogleEarthAPI') {
        return this.trigger('click', marker, event);
      } else {
        nearbyMarkerData = [];
        nonNearbyMarkers = [];
        nDist = this.nearbyDistance;
        pxSq = nDist * nDist;
        markerPt = this.llToPt(marker.position);
        ref2 = this.markers;
        for (l = ref2.length - 1; l >= 0; l--) {
          m = ref2[l];
          if (!((m.map !== null) && m.getVisible())) {
            continue;
          }
          mPt = this.llToPt(m.position);
          if (this.ptDistanceSq(mPt, markerPt) < pxSq) {
            nearbyMarkerData.push({
              marker: m,
              markerPt: mPt
            });
          } else {
            nonNearbyMarkers.push(m);
          }
        }
        if (nearbyMarkerData.length === 1) {
          return this.trigger('click', marker, event);
        } else {
          return this.spiderfy(nearbyMarkerData, nonNearbyMarkers);
        }
      }
    };

    // p.markersNearMarker = function(marker, firstOnly) {
    //   var i, m, mPt, markerPt, markers, nDist, pxSq, ref2, ref3, ref4;
    //   if (firstOnly === null) {
    //     firstOnly = false;
    //   }
    //   if (this.projHelper.getProjection() === null) {
    //     throw 'Must wait for "idle" event on map before calling markersNearMarker';
    //   }
    //   nDist = this.nearbyDistance;
    //   pxSq = nDist * nDist;
    //   markerPt = this.llToPt(marker.position);
    //   markers = [];
    //   ref2 = this.markers;
    //   for (i = ref2.length - 1; i >= 0; i--) {
    //     m = ref2[i];
    //     if (m === marker || (m.map === null) || !m.getVisible()) {
    //       continue;
    //     }
    //     mPt = this.llToPt((ref3 = (ref4 = m._omsData) !== null ? ref4.usualPosition : void 0) !== null ? ref3 : m.position);
    //     if (this.ptDistanceSq(mPt, markerPt) < pxSq) {
    //       markers.push(m);
    //       if (firstOnly) {
    //         break;
    //       }
    //     }
    //   }
    //   return markers;
    // };

    // p.markersNearAnyOtherMarker = function() {
    //   var i, i1, i2, m, m1, m1Data, m2, m2Data, mData, nDist, pxSq, ref2, ref3, results;
    //   if (this.projHelper.getProjection() === null) {
    //     throw 'Must wait for "idle" event on map before calling markersNearAnyOtherMarker';
    //   }
    //   nDist = this.nearbyDistance;
    //   pxSq = nDist * nDist;
    //   mData = (function() {
    //     var l, ref2, ref3, ref4, results;
    //     ref2 = this.markers;
    //     results = [];
    //     for (l = ref2.length - 1; l >= 0; l--) {
    //       m = ref2[l];
    //       results.push({
    //         pt: this.llToPt((ref3 = (ref4 = m._omsData) !== null ? ref4.usualPosition : void 0) !== null ? ref3 : m.position),
    //         willSpiderfy: false
    //       });
    //     }
    //     return results;
    //   }).call(this);

    //   ref2 = this.markers;
    //   for (i1 = ref2.length - 1; i1 >= 0; i1--) {
    //     m1 = ref2[i1];
    //     if (!((m1.map !== null) && m1.getVisible())) {
    //       continue;
    //     }
    //     m1Data = mData[i1];
    //     if (m1Data.willSpiderfy) {
    //       continue;
    //     }
    //     ref3 = this.markers;
    //     for (i2 = ref3.length - 1; i2 >= 0; i2--) {
    //       m2 = ref3[i2];
    //       if (i2 === i1) {
    //         continue;
    //       }
    //       if (!((m2.map !== null) && m2.getVisible())) {
    //         continue;
    //       }
    //       m2Data = mData[i2];
    //       if (i2 < i1 && !m2Data.willSpiderfy) {
    //         continue;
    //       }
    //       if (this.ptDistanceSq(m1Data.pt, m2Data.pt) < pxSq) {
    //         m1Data.willSpiderfy = m2Data.willSpiderfy = true;
    //         break;
    //       }
    //     }
    //   }
    //   results = [];
    //   for (i = ref2.length - 1; i >= 0; i--) {
    //     if (mData[i].willSpiderfy) {
    //       results.push(ref2[i]);
    //     }
    //   }
    //   return results;
    // };

    p.makeHighlightListenerFuncs = function(marker) {
      return {
        highlight: (function(_this) {
          return function() {
            return marker._omsData.leg.setOptions({
              strokeColor: _this.legColors.highlighted[_this.map.mapTypeId],
              zIndex: _this.highlightedLegZIndex
            });
          };
        })(this),
        unhighlight: (function(_this) {
          return function() {
            return marker._omsData.leg.setOptions({
              strokeColor: _this.legColors.usual[_this.map.mapTypeId],
              zIndex: _this.usualLegZIndex
            });
          };
        })(this)
      };
    };

    p.spiderfy = function(markerData, nonNearbyMarkers) {
      var bodyPt, footLl, footPt, footPts, highlightListenerFuncs, leg, marker, nearestMarkerDatum, numFeet, spiderfiedMarkers;
      this.spiderfying = true;
      numFeet = markerData.length;
      bodyPt = this.ptAverage((function() {
        var l, results;
        results = [];
        for (l = markerData.length - 1; l >= 0; l--) {
          results.push(markerData[l].markerPt);
        }
        return results;
      })());
      footPts = numFeet >= this.circleSpiralSwitchover ? this.generatePtsSpiral(numFeet, bodyPt).reverse() : this.generatePtsCircle(numFeet, bodyPt);
      spiderfiedMarkers = (function() {
        var l, results;
        results = [];
        var func = function(_this) {
          return function(md) {
            return _this.ptDistanceSq(md.markerPt, footPt);
          };
        };
        for (l = footPts.length - 1; l >= 0; l--) {
          footPt = footPts[l];
          footLl = this.ptToLl(footPt);
          nearestMarkerDatum = this.minExtract(markerData, (func)(this));
          marker = nearestMarkerDatum.marker;
          leg = new gm.Polyline({
            map: this.map,
            path: [marker.position, footLl],
            strokeColor: this.legColors.usual[this.map.mapTypeId],
            strokeWeight: this.legWeight,
            zIndex: this.usualLegZIndex
          });
          marker._omsData = {
            usualPosition: marker.position,
            leg: leg
          };
          if (this.legColors.highlighted[this.map.mapTypeId] !== this.legColors.usual[this.map.mapTypeId]) {
            highlightListenerFuncs = this.makeHighlightListenerFuncs(marker);
            marker._omsData.hightlightListeners = {
              highlight: ge.addListener(marker, 'mouseover', highlightListenerFuncs.highlight),
              unhighlight: ge.addListener(marker, 'mouseout', highlightListenerFuncs.unhighlight)
            };
          }
          marker.setPosition(footLl);
          marker.setZIndex(Math.round(this.spiderfiedZIndex + footPt.y));
          results.push(marker);
        }
        return results;
      }).call(this);
      delete this.spiderfying;
      this.spiderfied = true;
      return this.trigger('spiderfy', spiderfiedMarkers, nonNearbyMarkers);
    };

    p.unspiderfy = function(markerNotToMove) {
      var l, listeners, marker, nonNearbyMarkers, ref2, unspiderfiedMarkers;
      if (markerNotToMove === null) {
        markerNotToMove = null;
      }
      if (this.spiderfied === null) {
        return this;
      }
      this.unspiderfying = true;
      unspiderfiedMarkers = [];
      nonNearbyMarkers = [];
      ref2 = this.markers;
      for (l = ref2.length - 1; l >= 0; l--) {
        marker = ref2[l];
        if (marker._omsData) {
          marker._omsData.leg.setMap(null);
          if (marker !== markerNotToMove) {
            marker.setPosition(marker._omsData.usualPosition);
          }
          marker.setZIndex(null);
          listeners = marker._omsData.hightlightListeners;
          if (listeners) {
            ge.removeListener(listeners.highlight);
            ge.removeListener(listeners.unhighlight);
          }
          delete marker._omsData;
          unspiderfiedMarkers.push(marker);
        } else {
          nonNearbyMarkers.push(marker);
        }
      }
      delete this.unspiderfying;
      delete this.spiderfied;
      this.trigger('unspiderfy', unspiderfiedMarkers, nonNearbyMarkers);
      return this;
    };

    p.ptDistanceSq = function(pt1, pt2) {
      var dx, dy;
      dx = pt1.x - pt2.x;
      dy = pt1.y - pt2.y;
      return dx * dx + dy * dy;
    };

    p.ptAverage = function(pts) {
      var l, len1 = pts.length, numPts, pt, sumX, sumY;
      sumX = sumY = 0;
      for (l = len1 - 1; l >= 0; l--) {
        pt = pts[l];
        sumX += pt.x;
        sumY += pt.y;
      }
      numPts = len1;
      return new gm.Point(sumX / numPts, sumY / numPts);
    };

    p.llToPt = function(ll) {
      return this.projHelper.getProjection().fromLatLngToDivPixel(ll);
    };

    p.ptToLl = function(pt) {
      return this.projHelper.getProjection().fromDivPixelToLatLng(pt);
    };

    p.minExtract = function(set, func) {
      var bestIndex, bestVal, index, val;
      for (index = set.length - 1; index >= 0; index--) {
        val = func(set[index]);
        if ((typeof bestIndex === 'undefined' || bestIndex === null) || val < bestVal) {
          bestVal = val;
          bestIndex = index;
        }
      }
      return set.splice(bestIndex, 1)[0];
    };

    p.arrIndexOf = function(arr, obj) {
      if (arr.indexOf !== null) {
        return arr.indexOf(obj);
      }
      for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === obj) {
          return i;
        }
      }
      return -1;
    };

    _Class.ProjHelper = function(map) {
      return this.setMap(map);
    };

    _Class.ProjHelper.prototype = new gm.OverlayView();
    _Class.ProjHelper.prototype.draw = function() {};

    return _Class;

  })();

};
