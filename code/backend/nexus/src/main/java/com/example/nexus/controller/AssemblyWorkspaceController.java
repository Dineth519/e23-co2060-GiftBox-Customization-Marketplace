package com.example.nexus.controller;

import com.example.nexus.service.AssemblyRules;
import com.example.nexus.service.AssemblyService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/assembler/orders")
public class AssemblyWorkspaceController {
    private final AssemblyService service;
    public AssemblyWorkspaceController(AssemblyService service) { this.service = service; }

    private int assemblerId(Authentication auth) {
        if (auth == null || !(auth.getDetails() instanceof Integer id) ||
                auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ASSEMBLER")))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assembler access required.");
        return id;
    }
    @GetMapping
    public List<Map<String, Object>> list(Authentication auth) { return service.list(assemblerId(auth)); }
    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable int id, Authentication auth) { return service.get(id, assemblerId(auth)); }
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable int id, @RequestBody AssemblyRules.Change change, Authentication auth) {
        return service.update(id, assemblerId(auth), change);
    }
}
